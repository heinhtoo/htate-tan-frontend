export type CustomerResponse = {
  id: string;
  nrc?: string;
  name?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  township?: string;
  address?: string;
  version: number;
  creditLimit: number;
  totalDebt: number;
};
