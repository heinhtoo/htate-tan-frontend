import { z } from "zod";

export const ProfileSchema = z.object({
  username: z.string().min(1, { message: "Username should not be empty." }),
  name: z.string().min(1, { message: "Name should not be empty." }),
  email: z.string().min(1, { message: "Email should not be empty." }).email({
    message: "Email should be valid.",
  }),
  phoneNumber: z
    .string()
    .min(1, { message: "Phone number should not be empty." }),
});
