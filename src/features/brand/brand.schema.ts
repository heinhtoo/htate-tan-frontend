import { z } from "zod";

export const BrandSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  imagePath: z.string().min(1, {
    message: "Image path is required",
  }),
  productTypeIds: z.array(z.number()),
});
