import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),

  // z.coerce.number() ensures string inputs (from HTML forms) are treated as numbers
  price: z.coerce
    .number()
    .min(0, { message: "Price must be a positive number" }),

  description: z.string().optional(),

  imagePath: z.string().optional(),

  lowStockAlertAt: z.coerce
    .number()
    .min(0, { message: "Low stock alert must be 0 or greater" })
    .default(5),

  // Relation IDs (Required)
  categoryId: z.coerce
    .number({ error: "Category is required" })
    .min(1, { message: "Please select a category" }),

  brandId: z.coerce
    .number({ error: "Brand is required" })
    .min(1, { message: "Please select a brand" }),

  productTypeId: z.coerce
    .number({ error: "Product Type is required" })
    .min(1, { message: "Please select a product type" }),

  // Optional Group
  groupId: z.coerce.number().optional(),
});

/**
 * Schema for validating the restock form data.
 */
export const RestockSchema = z.object({
  // --- Product Context (Often hidden/pre-filled in the UI) ---
  productId: z.coerce
    .number()
    .min(1, { message: "Product ID is required for restock." }),

  // --- Inventory Details ---
  warehouseId: z.coerce
    .number()
    .min(1, { message: "Please select the destination warehouse." }),

  purchasedQuantity: z.coerce
    .number()
    .int({ message: "Quantity must be a whole number." })
    .min(1, { message: "Quantity must be at least 1." }),

  // --- Purchase/Cost Details ---
  purchasedPrice: z.coerce
    .number()
    .min(0.01, { message: "Purchased price must be greater than zero." }),

  purchasedCurrency: z.string().length(3, {
    message: "Currency must be a 3-letter code (e.g., USD, MMK).",
  }),

  purchasedPriceInMMK: z.coerce.number().min(0, {
    message: "MMK cost must be non-negative (including 0 for free goods).",
  }),
});
