import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { PaymentTypeResponse } from "./payment-type.response";
import type { PaymentTypeSchema } from "./payment-type.schema";

async function getPaymentTypesFn({
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
    APIResponse<PaymentTypeResponse[]>
  >(
    "/internal/payment-type?currentPage=" +
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

async function createPaymentTypeFn({
  data,
}: {
  data: z.infer<typeof PaymentTypeSchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<PaymentTypeResponse>
  >(
    "/internal/payment-type/",
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

async function updatePaymentTypeFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof PaymentTypeSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<
    APIResponse<PaymentTypeResponse>
  >(
    "/internal/payment-type/" + id,
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

async function removePaymentTypeFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<PaymentTypeResponse>
  >("/internal/payment-type/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getPaymentTypes = withHandler(getPaymentTypesFn);
export const createPaymentType = withHandler(createPaymentTypeFn);
export const updatePaymentType = withHandler(updatePaymentTypeFn);
export const removePaymentType = withHandler(removePaymentTypeFn);
