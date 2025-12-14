import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { OtherChargeResponse } from "./other-charge.response";
import type { OtherChargeSchema } from "./other-charge.schema";

async function getOtherChargesFn({
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
    APIResponse<OtherChargeResponse[]>
  >(
    "/internal/other-charge?currentPage=" +
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

async function createOtherChargeFn({
  data,
}: {
  data: z.infer<typeof OtherChargeSchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<OtherChargeResponse>
  >(
    "/internal/other-charge/",
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

async function updateOtherChargeFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof OtherChargeSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<
    APIResponse<OtherChargeResponse>
  >(
    "/internal/other-charge/" + id,
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

async function removeOtherChargeFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<OtherChargeResponse>
  >("/internal/other-charge/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getOtherCharges = withHandler(getOtherChargesFn);
export const createOtherCharge = withHandler(createOtherChargeFn);
export const updateOtherCharge = withHandler(updateOtherChargeFn);
export const removeOtherCharge = withHandler(removeOtherChargeFn);
