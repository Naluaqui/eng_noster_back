import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { findMeetingsForAnalysis } from './multi-agents.repository';
import type { AiAnalysisRequest, AiAnalysisResponse, AnalysisMeeting, AnalyzeMeetingsInput } from './multi-agents.types';

const aiRequestTimeoutMs = 120_000;

function createAnalysisId(meetings: AnalysisMeeting[]) {
  if (meetings.length === 1) {
    return meetings[0].id;
  }

  return `lote_${Date.now()}`;
}

function buildTranscript(meetings: AnalysisMeeting[]) {
  const transcriptMeetings = meetings.map((meeting) => ({
    ...meeting,
    transcript: meeting.description?.trim(),
  }));
  const meetingsWithoutTranscript = transcriptMeetings
    .filter((meeting) => !meeting.transcript)
    .map((meeting) => meeting.id);

  if (meetingsWithoutTranscript.length > 0) {
    throw new AppError('Uma ou mais reunioes anexadas nao possuem transcricao na descricao.', 400, {
      meetingIds: meetingsWithoutTranscript,
    });
  }

  if (transcriptMeetings.length === 1) {
    return transcriptMeetings[0].transcript as string;
  }

  return transcriptMeetings
    .map((meeting) => `[REUNIAO ${meeting.id}]\n${meeting.transcript as string}`)
    .join('\n\n');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === 'string';
}

function isDetectedPeople(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (person) =>
        isRecord(person) &&
        typeof person.nome === 'string' &&
        typeof person.papel === 'string' &&
        typeof person.lado === 'string' &&
        isOptionalString(person.evidencia),
    )
  );
}

function isDetectedCompanies(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (company) =>
        typeof company === 'string' ||
        (isRecord(company) &&
          typeof company.nome === 'string' &&
          (company.setor === undefined || typeof company.setor === 'string')),
    )
  );
}

function isDetectedProducts(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (product) =>
        typeof product === 'string' ||
        (isRecord(product) &&
          typeof product.nome === 'string' &&
          (product.descricao === undefined || typeof product.descricao === 'string')),
    )
  );
}

function isDetectedThemes(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (theme) =>
        typeof theme === 'string' ||
        (isRecord(theme) && typeof theme.tema === 'string' && isOptionalString(theme.evidencia)),
    )
  );
}

function isDetectedDetails(value: unknown, label: 'prazo' | 'acao') {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.every(
        (item) => isRecord(item) && typeof item[label] === 'string' && isOptionalString(item.evidencia),
      ))
  );
}

function isAiAnalysisResponse(value: unknown): value is AiAnalysisResponse {
  if (!isRecord(value) || !isRecord(value.analise)) {
    return false;
  }

  const analysis = value.analise;
  const entities = analysis.entidades_detectadas;
  const solution = analysis.solucao_final_clara;
  const personas = analysis.comentarios_relevantes_das_personas;

  return (
    typeof value.status === 'string' &&
    typeof value.id_reuniao === 'string' &&
    (value.pergunta_opcional === null || typeof value.pergunta_opcional === 'string') &&
    typeof analysis.resumo_executivo === 'string' &&
    typeof analysis.diagnostico_central === 'string' &&
    (analysis.resposta_da_pergunta === null || typeof analysis.resposta_da_pergunta === 'string') &&
    isRecord(entities) &&
    isDetectedPeople(entities.pessoas) &&
    isDetectedCompanies(entities.empresas) &&
    isDetectedProducts(entities.produtos) &&
    isDetectedThemes(entities.temas) &&
    isDetectedDetails(entities.prazos, 'prazo') &&
    isDetectedDetails(entities.proximas_acoes, 'acao') &&
    Array.isArray(personas) &&
    personas.every(
      (persona) =>
        isRecord(persona) &&
        typeof persona.persona === 'string' &&
        typeof persona.comentario_direcionador === 'string',
    ) &&
    isStringArray(analysis.riscos_criticos) &&
    isStringArray(analysis.oportunidades) &&
    isStringArray(analysis.pontos_de_incerteza) &&
    isRecord(solution) &&
    typeof solution.onde_focar === 'string' &&
    typeof solution.o_que_fazer === 'string' &&
    typeof solution.como_fazer === 'string' &&
    typeof solution.porque === 'string' &&
    typeof solution.impactos === 'string' &&
    typeof solution.proximo_passo_imediato === 'string'
  );
}

export async function analyzeMeetings(companyId: string | undefined, input: AnalyzeMeetingsInput) {
  const meetings = await findMeetingsForAnalysis(input.meetingIds, companyId);

  if (meetings.length !== input.meetingIds.length) {
    const foundMeetingIds = new Set(meetings.map((meeting) => meeting.id));
    throw new AppError('Uma ou mais reunioes nao foram encontradas.', 404, {
      meetingIds: input.meetingIds.filter((meetingId) => !foundMeetingIds.has(meetingId)),
    });
  }

  const requestPayload: AiAnalysisRequest = {
    texto_transcricao: buildTranscript(meetings),
    id_reuniao: createAnalysisId(meetings),
    ...(input.question ? { pergunta_opcional: input.question } : {}),
  };
  const endpoint = `${env.aiApiUrl.replace(/\/$/, '')}/api/analisar`;
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), aiRequestTimeoutMs);

  if (env.nodeEnv === 'development') {
    console.info('[multi-agents] Enviando reunioes para analise.', {
      endpoint,
      meetingIds: input.meetingIds,
      hasQuestion: Boolean(input.question),
    });
  }

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: abortController.signal,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'A analise demorou alem do limite esperado.'
        : 'Nao foi possivel acessar o servico de IA.';

    throw new AppError(message, 502, { endpoint });
  } finally {
    clearTimeout(timeout);
  }

  if (env.nodeEnv === 'development') {
    console.info('[multi-agents] Resposta da IA recebida.', {
      endpoint,
      status: response.status,
    });
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw new AppError('O servico de IA retornou uma resposta invalida.', 502, {
      endpoint,
      status: response.status,
    });
  }

  if (!response.ok) {
    const detail =
      responseBody && typeof responseBody === 'object' && 'detail' in responseBody
        ? String((responseBody as { detail: unknown }).detail)
        : 'Falha ao analisar reunioes.';

    throw new AppError(detail, 502, {
      endpoint,
      status: response.status,
      responseBody,
    });
  }

  if (!isAiAnalysisResponse(responseBody)) {
    if (env.nodeEnv === 'development') {
      console.warn('[multi-agents] A IA retornou JSON fora do formato de exibicao estruturada.', {
        endpoint,
        status: response.status,
      });
    }
  }

  return responseBody;
}
