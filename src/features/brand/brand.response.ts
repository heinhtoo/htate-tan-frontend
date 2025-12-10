import type { ProductTypeResponse } from "../product-type/product-type.response";

export type BrandResponse = {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  version: number;
  productType: ProductTypeResponse[];
  productCount: number;
};
