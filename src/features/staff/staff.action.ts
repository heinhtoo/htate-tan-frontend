import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { StaffResponse } from "./staff.response";
import type { StaffSchema } from "./staff.schema";

async function getStaffsFn({
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
  const response = await axiosClientInstance.get<APIResponse<StaffResponse[]>>(
    "/internal/staff?currentPage=" +
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

async function createStaffFn({ data }: { data: z.infer<typeof StaffSchema> }) {
  const response = await axiosClientInstance.post<APIResponse<StaffResponse>>(
    "/internal/staff/",
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

async function updateStaffFn({
  id,
  data,
  version,
}: {
  id: string;
  data: z.infer<typeof StaffSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<APIResponse<StaffResponse>>(
    "/internal/staff/" + id,
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

async function refreshPasswordStaffFn({ id }: { id: string }) {
  const response = await axiosClientInstance.put<APIResponse<StaffResponse>>(
    "/internal/staff/" + id + "/refresh-password"
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function removeStaffFn({ id, version }: { id: string; version: number }) {
  const response = await axiosClientInstance.delete<APIResponse<StaffResponse>>(
    "/internal/staff/" + id + "?version=" + version
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getStaffs = withHandler(getStaffsFn);
export const createStaff = withHandler(createStaffFn);
export const updateStaff = withHandler(updateStaffFn);
export const removeStaff = withHandler(removeStaffFn);
export const refreshPassword = withHandler(refreshPasswordStaffFn);
