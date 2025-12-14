import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { SupplierResponse } from "./supplier.response";
import type { SupplierSchema } from "./supplier.schema";

async function getSuppliersFn({
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
  const response = await axiosClientInstance.get<
    APIResponse<SupplierResponse[]>
  >(
    "/internal/supplier?currentPage=" +
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

async function createSupplierFn({
  data,
}: {
  data: z.infer<typeof SupplierSchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<SupplierResponse>
  >(
    "/internal/supplier/",
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

async function updateSupplierFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof SupplierSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<APIResponse<SupplierResponse>>(
    "/internal/supplier/" + id,
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

async function removeSupplierFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<SupplierResponse>
  >("/internal/supplier/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getSuppliers = withHandler(getSuppliersFn);
export const createSupplier = withHandler(createSupplierFn);
export const updateSupplier = withHandler(updateSupplierFn);
export const removeSupplier = withHandler(removeSupplierFn);
