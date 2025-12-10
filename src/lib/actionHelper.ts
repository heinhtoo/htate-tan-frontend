/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";

export type ErrorResponse = {
  payload: any;
  error: {
    detailMessage: string;
    referenceId: string;
  };
  message: string;
  signature: string;
  status: string;
  statusCode: number;
  timestamp: string;
  type: string;
  version: string;
};

export function withHandler<T extends (...args: any[]) => Promise<any>>(
  serverFn: T
) {
  return async (
    ...args: Parameters<T>
  ): Promise<{
    response: Awaited<ReturnType<T>> | null;
    error: ErrorResponse | AxiosError | null;
  }> => {
    try {
      const data = await serverFn(...args);
      return { response: data, error: null };
    } catch (err) {
      return {
        response: null,
        error: (err as any)?.response?.data ?? err,
      };
    }
  };
}
