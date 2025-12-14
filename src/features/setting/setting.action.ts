import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { MessageResponse } from "@/types/api-response";
import type { APIResponse } from "@/types/response";
import { z } from "zod";
import type { KeyValueType, SettingResponse } from "./setting.response";
import { SettingSchema } from "./setting.schema";

async function getSettingFn({ settingKey }: { settingKey: string }) {
  const response = await axiosClientInstance.get<APIResponse<SettingResponse>>(
    "/internal/setting/" + settingKey
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

async function updateSettingFn({
  data,
  settingKey,
  type,
}: {
  data: z.infer<typeof SettingSchema>;
  settingKey: string;
  type: KeyValueType;
}) {
  const response = await axiosClientInstance.patch<
    APIResponse<MessageResponse>
  >(
    "/internal/setting/" + settingKey,
    addExtraData({
      ...data,
      type,
    })
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getSetting = withHandler(getSettingFn);
export const updateSetting = withHandler(updateSettingFn);
