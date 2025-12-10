import z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z
    .string()
    .max(255, "Description cannot exceed 255 characters.")
    .optional(),
  productTypeId: z.number().min(1, "Product Type is required."), // Relates to ProductType entity
  // The image path can be optional, but if present, should be a URL (for simplicity here)
  imagePath: z
    .string()
    .url("Must be a valid image URL.")
    .optional()
    .or(z.literal("")),
});
