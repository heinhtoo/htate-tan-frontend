import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { CategoryResponse } from "./category.response";
import type { categorySchema } from "./category.schema";

async function getCategoriesFn({
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
    APIResponse<CategoryResponse[]>
  >(
    "/internal/category?currentPage=" +
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

async function createCategoryFn({
  data,
}: {
  data: z.infer<typeof categorySchema>;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<CategoryResponse>
  >(
    "/internal/category/",
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

async function updateCategoryFn({
  id,
  data,
  version,
}: {
  id: number;
  data: z.infer<typeof categorySchema>;
  version: number;
}) {
  const response = await axiosClientInstance.put<APIResponse<CategoryResponse>>(
    "/internal/category/" + id,
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

async function removeCategoryFn({
  id,
  version,
}: {
  id: number;
  version: number;
}) {
  const response = await axiosClientInstance.delete<
    APIResponse<CategoryResponse>
  >("/internal/category/" + id + "?version=" + version);

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getCategories = withHandler(getCategoriesFn);
export const createCategory = withHandler(createCategoryFn);
export const updateCategory = withHandler(updateCategoryFn);
export const removeCategory = withHandler(removeCategoryFn);
