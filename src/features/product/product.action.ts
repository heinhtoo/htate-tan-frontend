import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { MessageResponse } from "@/types/api-response";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { ProductResponse } from "./product.response";
import type { ProductSchema } from "./product.schema";

async function getProductsFn({
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
    APIResponse<ProductResponse[]>
  >(
    "/internal/product?currentPage=" +
      (parseInt(page) + 1) +
      "&pageSize=" +
      size +
      (s
        ? Array.isArray(s)
          ? s.map((item) => "&s=" + item).join("")
          : "&s=" + s
        : "") +
      (q ? "&q=" + q : ""),
  );

  const data = response.data;
  return { data: data.payload, pagination: data.pagination };
}

async function getProductFn({ sku }: { sku: string }) {
  if (sku === "create") {
    return undefined;
  }
  const response = await axiosClientInstance.get<APIResponse<ProductResponse>>(
    "/internal/product/" + sku,
  );

  const data = response.data;

  return { data: data.payload };
}

async function getLastUpdatedAtFn() {
  const response = await axiosClientInstance.get<
    APIResponse<{ lastUpdatedAt: string }>
  >("/internal/product/active-time/last-updated-at");

  const data = response.data;

  return { data: data.payload };
}

async function createProductFn({
  data,
}: {
  data: z.infer<typeof ProductSchema>;
}) {
  const response = await axiosClientInstance.post<APIResponse<ProductResponse>>(
    "/internal/product/",
    addExtraData({
      ...data,
    }),
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function updateProductFn({
  sku,
  data,
  version,
}: {
  sku: string;
  data: z.infer<typeof ProductSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<APIResponse<ProductResponse>>(
    "/internal/product/" + sku,
    addExtraData({
      ...data,
      version,
    }),
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function removeProductFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<ProductResponse>
  >("/internal/product/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function restockProductFn({
  payload,
}: {
  payload: {
    productId: number;
    warehouseId: number;
    purchasedQuantity: number;
    purchasedPriceInMMK: number;
  };
}) {
  // POST request to the restock endpoint
  const response = await axiosClientInstance.post<APIResponse<MessageResponse>>(
    "/internal/product/restock",
    addExtraData({
      ...payload,
    }),
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;

  // The 'result' will contain the newly created StockResponse object upon success.
  return { isSuccess, result };
}

export const getProducts = withHandler(getProductsFn);
export const getProduct = withHandler(getProductFn);
export const createProduct = withHandler(createProductFn);
export const updateProduct = withHandler(updateProductFn);
export const removeProduct = withHandler(removeProductFn);
export const restockProduct = withHandler(restockProductFn);
export const getLastUpdatedAt = withHandler(getLastUpdatedAtFn);
