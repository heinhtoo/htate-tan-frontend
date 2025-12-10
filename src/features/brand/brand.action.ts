import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { BrandResponse } from "./brand.response";
import type { BrandSchema } from "./brand.schema";

async function getBrandsFn({
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
  const response = await axiosClientInstance.get<APIResponse<BrandResponse[]>>(
    "/internal/brand?currentPage=" +
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

async function createBrandFn({ data }: { data: z.infer<typeof BrandSchema> }) {
  const response = await axiosClientInstance.post<APIResponse<BrandResponse>>(
    "/internal/brand/",
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

async function updateBrandFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof BrandSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<APIResponse<BrandResponse>>(
    "/internal/brand/" + id,
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

async function removeBrandFn({ id, version }: { id: number; version: number }) {
  const response = await axiosClientInstance.delete<APIResponse<BrandResponse>>(
    "/internal/brand/" + id + "?version=" + version
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getBrands = withHandler(getBrandsFn);
export const createBrand = withHandler(createBrandFn);
export const updateBrand = withHandler(updateBrandFn);
export const removeBrand = withHandler(removeBrandFn);
