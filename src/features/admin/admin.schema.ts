import { z } from "zod";

export const AdminSchema = z.object({
  username: z.string().min(1, { message: "Username should not be empty" }),

  password: z.string().min(1, { message: "Password should not be empty" }),
});

export const AdminUpdateSchema = AdminSchema.omit({
  password: true,
});
