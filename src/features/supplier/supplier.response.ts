export type SupplierResponse = {
  id: number;
  name: string;
  contact: string;
  address?: string;
  version: number;
  totalDebt: number;
  totalPendingOrders: number;
};
