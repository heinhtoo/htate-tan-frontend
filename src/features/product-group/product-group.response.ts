export type ProductGroupResponse = {
  id: number;
  name: string;
  description: string;
  version: number;
  brand: { id: number; name: string }[];
};
