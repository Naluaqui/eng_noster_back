import { Router } from 'express';
import {
  createCompanyController,
  deleteCompanyController,
  getCompanySettingsController,
  listCompaniesController,
  updateCompanySettingsController,
} from './settings.controller';

export const settingsRoutes = Router();

settingsRoutes.get('/companies', listCompaniesController);
settingsRoutes.post('/companies', createCompanyController);
settingsRoutes.delete('/companies/:companyId', deleteCompanyController);
settingsRoutes.get('/company', getCompanySettingsController);
settingsRoutes.put('/company', updateCompanySettingsController);
