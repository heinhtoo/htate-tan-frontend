export type ProductGroupResponse = {
  id: number;
  name: string;
  description: string;
  version: number;
  product: { id: number; name: string; sku: string }[];
};
