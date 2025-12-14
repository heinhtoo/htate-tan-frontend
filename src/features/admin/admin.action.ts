import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { AdminResponse } from "./admin.response";
import type { AdminSchema } from "./admin.schema";

async function getAdminsFn({
  page = "1",
  size = "5",
  s,
  q,
}: {
  page: string;
  size: string;
  s?: string | string[];
  q?: string;
}) {
  const response = await axiosClientInstance.get<APIResponse<AdminResponse[]>>(
    "/internal/admin?currentPage=" +
      (parseInt(page) + 1) +
      "&pageSize=" +
      size +
      (s
        ? Array.isArray(s)
          ? s.map((item) => "&s=" + item).join("")
          : "&s=" + s
        : "") +
      (q ? "&q=" + q : "")
  );

  const data = response.data;
  return { data: data.payload, pagination: data.pagination };
}

async function createAdminFn({ data }: { data: z.infer<typeof AdminSchema> }) {
  const response = await axiosClientInstance.post<APIResponse<AdminResponse>>(
    "/internal/admin/",
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

async function updateAdminFn({
  id,
  data,
  version,
}: {
  id: string;
  data: z.infer<typeof AdminSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<APIResponse<AdminResponse>>(
    "/internal/admin/" + id,
    addExtraData({
      ...data,
      version,
    })
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function refreshPasswordAdminFn({ id }: { id: string }) {
  const response = await axiosClientInstance.put<APIResponse<AdminResponse>>(
    "/internal/admin/" + id + "/refresh-password"
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function removeAdminFn({ id, version }: { id: string; version: number }) {
  const response = await axiosClientInstance.delete<APIResponse<AdminResponse>>(
    "/internal/admin/" + id + "?version=" + version
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getAdmins = withHandler(getAdminsFn);
export const createAdmin = withHandler(createAdminFn);
export const updateAdmin = withHandler(updateAdminFn);
export const removeAdmin = withHandler(removeAdminFn);
export const refreshPassword = withHandler(refreshPasswordAdminFn);
