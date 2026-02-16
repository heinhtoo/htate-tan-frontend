import { z } from "zod";

export const ProductGroupSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  brandIds: z.array(z.number()),
});

export const ModifyPriceSchema = z.object({
  isPercent: z.boolean(),
  value: z.coerce.number().min(0, {
    message: "Value must be greater than or equal to 0",
  }),
  isIncrement: z.boolean(),
});
