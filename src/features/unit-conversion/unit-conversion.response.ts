import type { CategoryResponse } from "../category/category.response";

export type UnitConversionResponse = {
  id: number;
  name: string;
  conversionRate: number;
  category?: CategoryResponse;
  version: number;
};
