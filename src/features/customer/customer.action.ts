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
}: {
  page: string;
  size: string;
  s?: string | string[];
  q?: string;
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
      (q ? "&q=" + q : "")
  );

  const data = response.data;
  return { data: data.payload, pagination: data.pagination };
}

async function createCustomerFn({
  data,
}: {
  data: z.infer<typeof CustomerSchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<CustomerResponse>
  >(
    "/common/customer/",
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

export const getCustomers = withHandler(getCustomersFn);
export const createCustomer = withHandler(createCustomerFn);
export const updateCustomer = withHandler(updateCustomerFn);
export const removeCustomer = withHandler(removeCustomerFn);
