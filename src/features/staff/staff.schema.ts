import { z } from "zod";

export const StaffSchema = z.object({
  username: z.string().min(1, { message: "Username should not be empty" }),

  password: z.string().min(1, { message: "Password should not be empty" }),

  nrc: z.string({ message: "NRC must be a string" }).optional(),

  name: z.string({ message: "Name must be a string" }).optional(),

  phoneNumber: z
    .string({ message: "Phone number must be a string" })
    .optional(),

  state: z.string({ message: "State must be a string" }).optional(),

  city: z.string({ message: "City must be a string" }).optional(),

  township: z.string({ message: "Township must be a string" }).optional(),

  address: z.string({ message: "Address must be a string" }).optional(),

  warehouseId: z
    .number({
      error: "Warehouse ID is required",
    })
    .int(),
});

export const StaffUpdateSchema = StaffSchema.omit({
  password: true,
});
