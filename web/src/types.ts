export type Provider = {
  id: string;
  full_name: string;
  specialty: string;
  created_at: string;
};

export type NewProviderInput = {
  full_name: string;
  specialty: string;
};

export type Status = {
  id: string;
  name: string;
  parent_id: string | null;
  order: number;
};

export type Patient = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  provider: Provider | null;
  status: Pick<Status, 'id' | 'name'> | null;
};

export type NewPatientInput = {
  full_name: string;
  email: string;
  phone: string;
  provider_id?: string | null;
  status_id?: string | null;
};
