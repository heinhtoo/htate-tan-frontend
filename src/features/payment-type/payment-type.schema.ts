import { z } from "zod";

export const PaymentTypeSchema = z.object({
  name: z.string().min(1, { message: "Name should not be empty" }),

  description: z
    .string()
    .min(1, { message: "Description should not be empty" }),

  displayName: z
    .string()
    .min(1, { message: "Display Name should not be empty" }),

  imagePath: z.string().min(1, { message: "Image Path should not be empty" }),

  accountNo: z.string({ message: "Account No must be a string" }).optional(),

  showQR: z.boolean({ message: "showQR must be a boolean" }).optional(),

  commission: z.number({
    error: "Commission should be valid number",
  }),

  showValue: z.boolean({ message: "showValue must be a boolean" }).optional(),
});
