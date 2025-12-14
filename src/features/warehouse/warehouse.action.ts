import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { WarehouseResponse } from "./warehouse.response";
import type { WarehouseSchema } from "./warehouse.schema";

async function getWarehousesFn({
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
    APIResponse<WarehouseResponse[]>
  >(
    "/internal/warehouse?currentPage=" +
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

async function createWarehouseFn({
  data,
}: {
  data: z.infer<typeof WarehouseSchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<WarehouseResponse>
  >(
    "/internal/warehouse/",
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

async function updateWarehouseFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof WarehouseSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<
    APIResponse<WarehouseResponse>
  >(
    "/internal/warehouse/" + id,
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

async function removeWarehouseFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<WarehouseResponse>
  >("/internal/warehouse/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getWarehouses = withHandler(getWarehousesFn);
export const createWarehouse = withHandler(createWarehouseFn);
export const updateWarehouse = withHandler(updateWarehouseFn);
export const removeWarehouse = withHandler(removeWarehouseFn);
