import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import type { APIResponse } from "@/types/response";

export interface BackupResult {
  skipped: boolean;
  filename: string;
  message: string;
}

export interface BackupFile {
  key: string;
  id: string;
  name: string;
  status: string;
}

async function triggerBackupFn() {
  const response = await axiosClientInstance.post<APIResponse<BackupResult>>(
    "/internal/backup/trigger"
  );
  const result = response.data;
  return { isSuccess: response.status >= 200 && response.status < 300, result };
}

async function listBackupsFn() {
  const response = await axiosClientInstance.get<APIResponse<BackupFile[]>>(
    "/internal/backup/list"
  );
  const result = response.data;
  return { isSuccess: response.status >= 200 && response.status < 300, result };
}

export const triggerBackup = withHandler(triggerBackupFn);
export const listBackups = withHandler(listBackupsFn);
