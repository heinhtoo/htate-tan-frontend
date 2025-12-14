import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { ProductGroupResponse } from "./product-group.response";
import type {
  ModifyPriceSchema,
  ProductGroupSchema,
} from "./product-group.schema";

async function getProductGroupsFn({
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
    APIResponse<ProductGroupResponse[]>
  >(
    "/internal/product-group?currentPage=" +
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

async function createProductGroupFn({
  data,
}: {
  data: z.infer<typeof ProductGroupSchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<ProductGroupResponse>
  >(
    "/internal/product-group/",
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

async function updateProductGroupFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof ProductGroupSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<
    APIResponse<ProductGroupResponse>
  >(
    "/internal/product-group/" + id,
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

async function removeProductGroupFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<ProductGroupResponse>
  >("/internal/product-group/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function modifyPriceFn({
  id,
  data,
}: {
  id: number;
  data: z.infer<typeof ModifyPriceSchema>;
}) {
  const response = await axiosClientInstance.put<
    APIResponse<ProductGroupResponse>
  >(
    "/internal/product-group/" + id + "/modify-price",
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

export const getProductGroups = withHandler(getProductGroupsFn);
export const createProductGroup = withHandler(createProductGroupFn);
export const updateProductGroup = withHandler(updateProductGroupFn);
export const removeProductGroup = withHandler(removeProductGroupFn);
export const modifyPrice = withHandler(modifyPriceFn);
