import type { WarehouseResponse } from "../warehouse/warehouse.response";

export type StaffResponse = {
  id: string;
  username: string;
  nrc?: string;
  name?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  township?: string;
  address?: string;
  version: number;
  warehouse?: WarehouseResponse;
};
