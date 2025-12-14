import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { CarGateResponse } from "./car-gate.response";
import type { CarGateSchema } from "./car-gate.schema";

async function getCarGatesFn({
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
    APIResponse<CarGateResponse[]>
  >(
    "/internal/car-gate?currentPage=" +
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

async function createCarGateFn({
  data,
}: {
  data: z.infer<typeof CarGateSchema>;
}) {
  const response = await axiosClientInstance.post<APIResponse<CarGateResponse>>(
    "/internal/car-gate/",
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

async function updateCarGateFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof CarGateSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<APIResponse<CarGateResponse>>(
    "/internal/car-gate/" + id,
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

async function removeCarGateFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<CarGateResponse>
  >("/internal/car-gate/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getCarGates = withHandler(getCarGatesFn);
export const createCarGate = withHandler(createCarGateFn);
export const updateCarGate = withHandler(updateCarGateFn);
export const removeCarGate = withHandler(removeCarGateFn);
