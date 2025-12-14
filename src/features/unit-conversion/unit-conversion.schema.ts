import { z } from "zod";

export const UnitConversionSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  conversionRate: z.coerce.number().min(1, "Conversion rate is required."),
  categoryId: z.number().min(1, "Category ID is required."),
});
