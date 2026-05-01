export type CompanySummary = {
  id: string;
  name: string;
};

export type CompanyProfileSettings = {
  id: string;
  name: string;
  about: string;
  objectives: string;
  culture: string;
};

export type CompanyProductSettings = {
  id?: string;
  name: string;
  about: string;
  solutionObjective: string;
  technology: string;
  targetAudience: string;
  averagePrice: string;
};

export type CompanyPersonSettings = {
  id?: string;
  email: string;
  role?: string;
  reportsToEmail?: string;
};

export type CompanyGroupSettings = {
  id?: string;
  name: string;
  about?: string;
  people: CompanyPersonSettings[];
};

export type CompanyTeamSettings = {
  id?: string;
  name: string;
  about?: string;
  people: CompanyPersonSettings[];
  groups: CompanyGroupSettings[];
};

export type CompanySettings = {
  company: CompanyProfileSettings;
  products: CompanyProductSettings[];
  teams: CompanyTeamSettings[];
};

export type UpdateCompanySettingsInput = {
  company: Omit<CompanyProfileSettings, 'id'>;
  products: CompanyProductSettings[];
  teams: CompanyTeamSettings[];
};

export type CreateCompanyInput = {
  name: string;
};
