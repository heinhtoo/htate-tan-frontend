import { z } from "zod";

export const SettingSchema = z.object({
  value: z.string().min(1, { message: "Value should not be empty." }),
});
