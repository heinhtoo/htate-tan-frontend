import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { ProductTypeResponse } from "./product-type.response";
import type { ProductTypeSchema } from "./product-type.schema";

async function getProductTypesFn({
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
    APIResponse<ProductTypeResponse[]>
  >(
    "/internal/product-type?currentPage=" +
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

async function createProductTypeFn({
  data,
}: {
  data: z.infer<typeof ProductTypeSchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<ProductTypeResponse>
  >(
    "/internal/product-type/",
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

async function updateProductTypeFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof ProductTypeSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<
    APIResponse<ProductTypeResponse>
  >(
    "/internal/product-type/" + id,
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

async function removeProductTypeFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<ProductTypeResponse>
  >("/internal/product-type/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getProductTypes = withHandler(getProductTypesFn);
export const createProductType = withHandler(createProductTypeFn);
export const updateProductType = withHandler(updateProductTypeFn);
export const removeProductType = withHandler(removeProductTypeFn);
