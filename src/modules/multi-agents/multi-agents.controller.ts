import type { Request, Response } from 'express';
import { parseAnalyzeMeetingsInput } from './multi-agents.schema';
import { analyzeMeetings } from './multi-agents.service';

function getCompanyId(request: Request) {
  const headerCompanyId = request.header('x-company-id');
  const queryCompanyId = request.query.companyId;

  return typeof queryCompanyId === 'string' ? queryCompanyId : headerCompanyId;
}

export async function analyzeMeetingsController(request: Request, response: Response) {
  const input = parseAnalyzeMeetingsInput(request.body);
  const analysis = await analyzeMeetings(getCompanyId(request), input);

  return response.status(200).json(analysis);
}
