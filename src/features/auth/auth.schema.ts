import { z } from "zod";
const WarehouseUserSignInFormSchema = z.object({
  warehouseInfo: z.string().min(1, {
    message: "Warehouse id or alias must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Please enter at least 6 characters.",
  }),
  rememberMe: z.boolean(),
});

const WarehouseUserSchemaWithoutRememberMe = WarehouseUserSignInFormSchema.omit(
  {
    rememberMe: true,
  }
);

export { WarehouseUserSchemaWithoutRememberMe, WarehouseUserSignInFormSchema };
