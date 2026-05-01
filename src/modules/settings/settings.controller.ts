import type { Request, Response } from 'express';
import { successResponse } from '../../shared/http/response';
import {
  createCompanyWorkspace,
  deleteCompanyWorkspace,
  getCompanySettings,
  getCompanySettingsById,
  listCompanies,
  updateCompanySettings,
} from './settings.service';

function getCompanyId(request: Request) {
  const headerCompanyId = request.header('x-company-id');
  const queryCompanyId = request.query.companyId;

  if (typeof queryCompanyId === 'string') {
    return queryCompanyId;
  }

  return headerCompanyId ?? '';
}

export async function listCompaniesController(_request: Request, response: Response) {
  const companies = await listCompanies();

  return response
    .status(200)
    .json(successResponse(companies, 'Empresas carregadas com sucesso.'));
}

export async function createCompanyController(request: Request, response: Response) {
  const company = await createCompanyWorkspace(request.body);

  return response
    .status(201)
    .json(successResponse(company, 'Empresa criada com sucesso.'));
}

export async function deleteCompanyController(request: Request, response: Response) {
  const companies = await deleteCompanyWorkspace(String(request.params.companyId));

  return response
    .status(200)
    .json(successResponse(companies, 'Empresa excluida com sucesso.'));
}

export async function getCompanySettingsController(request: Request, response: Response) {
  const companyId = getCompanyId(request);
  const settings = companyId ? await getCompanySettingsById(companyId) : await getCompanySettings();

  return response
    .status(200)
    .json(successResponse(settings, 'Configuracoes carregadas com sucesso.'));
}

export async function updateCompanySettingsController(request: Request, response: Response) {
  const settings = await updateCompanySettings(getCompanyId(request), request.body);

  return response
    .status(200)
    .json(successResponse(settings, 'Configuracoes salvas com sucesso.'));
}
