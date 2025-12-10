/* eslint-disable @typescript-eslint/no-explicit-any */
import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import { ProfileSchema } from "./profile.schema";

async function getProfileFn() {
  const response = await axiosClientInstance.get<APIResponse<any>>("/user/");

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function updateProfileFn({
  data,
  version,
}: {
  data: z.infer<typeof ProfileSchema>;
  version: number;
}) {
  const response = await axiosClientInstance.post<
    APIResponse<{
      name: string;
      email: string;
      phoneNumber: string;
      version: number;
    }>
  >(
    "/user/",
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

export const getProfile = withHandler(getProfileFn);
export const updateProfile = withHandler(updateProfileFn);
