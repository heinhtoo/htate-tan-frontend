import { z } from "zod";

export const SupplierSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  address: z.string().min(1, {
    message: "Address is required",
  }),
  contact: z.string().min(1, {
    message: "Contact is required",
  }),
});
