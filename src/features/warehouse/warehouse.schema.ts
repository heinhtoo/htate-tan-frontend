import { z } from "zod";

export const WarehouseSchema = z.object({
  name: z.string().min(1, { message: "Name should not be empty" }),

  location: z.string().min(1, { message: "Location should not be empty" }),

  isSellable: z.boolean({ message: "isSellable must be a boolean" }).optional(),

  orderLeadingText: z
    .string({ message: "Order leading text must be a string" })
    .optional(),
});
