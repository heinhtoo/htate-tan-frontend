import { z } from "zod";

export const CustomerSchema = z.object({
  name: z.string({ message: "Name must be a string" }).optional(),

  phoneNumber: z
    .string({ message: "Phone number must be a string" })
    .optional(),

  state: z.string({ message: "State must be a string" }).optional(),

  city: z.string({ message: "City must be a string" }).optional(),

  township: z.string({ message: "Township must be a string" }).optional(),

  address: z.string({ message: "Address must be a string" }).optional(),

  creditLimit: z
    .number({
      error: "Credit limit is required",
    })
    .int(),
});
