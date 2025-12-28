import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import type { APIResponse } from "@/types/response";

async function getServerInfoFn() {
  const response = await axiosClientInstance.get<
    APIResponse<{
      url: string;
      protocol: string;
      host: string;
      frontendUrl: string;
    }>
  >("/info");

  const data = response.data;
  return data.payload;
}

export const getServerInfo = withHandler(getServerInfoFn);
