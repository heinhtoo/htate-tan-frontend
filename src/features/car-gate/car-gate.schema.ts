import { z } from "zod";

export const CarGateSchema = z.object({
  gateName: z.string().min(1, {
    message: "Gate name is required",
  }),
  location: z.string().min(1, {
    message: "Location is required",
  }),
});
