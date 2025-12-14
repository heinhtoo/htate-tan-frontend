import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { UnitConversionResponse } from "./unit-conversion.response";
import type { UnitConversionSchema } from "./unit-conversion.schema";

async function getUnitConversionsFn({
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
    APIResponse<UnitConversionResponse[]>
  >(
    "/internal/unit-conversion?currentPage=" +
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

async function createUnitConversionFn({
  data,
}: {
  data: z.infer<typeof UnitConversionSchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<UnitConversionResponse>
  >(
    "/internal/unit-conversion/",
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

async function updateUnitConversionFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof UnitConversionSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<
    APIResponse<UnitConversionResponse>
  >(
    "/internal/unit-conversion/" + id,
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

async function removeUnitConversionFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<UnitConversionResponse>
  >("/internal/unit-conversion/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getUnitConversions = withHandler(getUnitConversionsFn);
export const createUnitConversion = withHandler(createUnitConversionFn);
export const updateUnitConversion = withHandler(updateUnitConversionFn);
export const removeUnitConversion = withHandler(removeUnitConversionFn);
