import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import type { APIResponse } from "@/types/response";
import type { TagResponse } from "./media.response";

async function getTagsFn() {
  const response =
    await axiosClientInstance.get<APIResponse<TagResponse[]>>("/file/tags");

  const data = response.data;
  return { data: data.payload, pagination: data.pagination };
}

async function getMediasFn({
  page,
  size = 5,
  q,
  tag,
}: {
  page: number | null;
  size: number;
  q?: string;
  tag: string;
}) {
  const response = await axiosClientInstance.get<
    APIResponse<{
      tag: string;
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number;
      previousPage: number;
      files: { filename: string; url: string }[];
    }>
  >(
    "/file" +
      `?tag=${tag}&limit=` +
      size +
      (q ? "&q=" + encodeURIComponent(q) : "") +
      (page ? "&page=" + page : "")
  );

  const data = response.data;
  return { data: data.payload, pagination: data.pagination };
}

async function uploadMediaFn({ formData }: { formData: FormData }) {
  const response = await axiosClientInstance.post<
    APIResponse<{ tag: string; files: { filename: string; url: string }[] }>
  >("/file/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getTags = withHandler(getTagsFn);
export const getMedias = withHandler(getMediasFn);
export const uploadMedia = withHandler(uploadMediaFn);
