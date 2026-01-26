/* eslint-disable @typescript-eslint/no-explicit-any */
import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { CustomerResponse } from "./customer.response";
import type { CustomerSchema } from "./customer.schema";

async function getCustomersFn({
  page = "1",
  size = "5",
  s,
  q,
  isCustomer,
}: {
  page: string;
  size: string;
  s?: string | string[];
  q?: string;
  isCustomer: boolean;
}) {
  const response = await axiosClientInstance.get<
    APIResponse<CustomerResponse[]>
  >(
    "/common/customer?currentPage=" +
      (parseInt(page) + 1) +
      "&pageSize=" +
      size +
      (s
        ? Array.isArray(s)
          ? s.map((item) => "&s=" + item).join("")
          : "&s=" + s
        : "") +
      (q ? "&q=" + q : "") +
      (isCustomer ? "&isCustomer=1" : "")
  );

  const data = response.data;
  return { data: data.payload, pagination: data.pagination };
}

async function getCustomerDetailsFn({ id, isCustomer }: { id: string, isCustomer:boolean }) {
  const response = await axiosClientInstance.get<APIResponse<any>>(
    "/common/customer/" + id +"?isCustomer=" + (isCustomer ? "1": "0")
  );

  const data = response.data;
  return data.payload;
}

async function createCustomerFn({
  data,
  isCustomer,
}: {
  data: z.infer<typeof CustomerSchema>;
  isCustomer: boolean;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<CustomerResponse>
  >(
    "/common/customer?isCustomer=" + (isCustomer ? "1" : "0"),
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

async function updateCustomerFn({
  id,
  data,
  version,
}: {
  id: string;
  data: z.infer<typeof CustomerSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<APIResponse<CustomerResponse>>(
    "/common/customer/" + id,
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

async function removeCustomerFn({
  id,
  version,
}: {
  id: string;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<CustomerResponse>
  >("/common/customer/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function addPaymentsFn({ id, payload }: { id: string; payload: any }) {
  const response = await axiosClientInstance.post<
    APIResponse<CustomerResponse>
  >("/common/customer/" + id + "/payments", addExtraData(payload));

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getCustomers = withHandler(getCustomersFn);
export const getCustomerDetails = withHandler(getCustomerDetailsFn);
export const createCustomer = withHandler(createCustomerFn);
export const updateCustomer = withHandler(updateCustomerFn);
export const removeCustomer = withHandler(removeCustomerFn);
export const addPayments = withHandler(addPaymentsFn);
