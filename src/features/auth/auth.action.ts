import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { MessageResponse } from "@/types/api-response";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { LoginResponse } from "./auth.response";
import type { WarehouseUserSchemaWithoutRememberMe } from "./auth.schema";

async function loginWarehouseUserFn({
  data,
}: {
  data: z.infer<typeof WarehouseUserSchemaWithoutRememberMe>;
}) {
  const response = await axiosClientInstance.post<APIResponse<LoginResponse>>(
    "/auth/signin",
    addExtraData({
      ...data,
    })
  );
  let isSuccess = false;

  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function refreshFn() {
  const response = await axiosClientInstance.post<APIResponse<LoginResponse>>(
    "/auth/refresh",
    {}
  );
  let isSuccess = false;

  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function logoutUserFn({
  deviceId,
  lastNotiSeenAt,
}: {
  deviceId: string;
  lastNotiSeenAt: string;
}) {
  const response = await axiosClientInstance.post<APIResponse<MessageResponse>>(
    "/auth/signout",
    addExtraData({ deviceId, lastNotiSeenAt })
  );
  let isSuccess = false;

  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function switchWarehouseFn({ data }: { data: { warehouseId: string } }) {
  const response = await axiosClientInstance.post<APIResponse<LoginResponse>>(
    "/auth/switch-warehouse",
    addExtraData({
      ...data,
    })
  );
  let isSuccess = false;

  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const loginWarehouseUser = withHandler(loginWarehouseUserFn);
export const switchWarehouse = withHandler(switchWarehouseFn);
export const refreshToken = withHandler(refreshFn);
export const logoutUser = withHandler(logoutUserFn);
