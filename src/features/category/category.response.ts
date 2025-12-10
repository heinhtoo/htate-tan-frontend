export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  imagePath: string;
  productType: {
    id: number;
    name: string;
  };
  productCount: number;
  version: number;
}
