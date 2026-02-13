/* eslint-disable @typescript-eslint/no-explicit-any */
import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import type { APIResponse } from "@/types/response";

async function getPrintersFn() {
  const response = await axiosClientInstance.get<APIResponse<string[]>>(
    "/internal/printer/list",
  );
  return response.data.payload;
}

async function printPdfFn({
  file,
  printerName,
}: {
  file: Blob;
  printerName?: string;
}) {
  const formData = new FormData();
  formData.append("file", file, "order.pdf");
  if (printerName) {
    formData.append("printerName", printerName);
  }

  const response = await axiosClientInstance.post<APIResponse<any>>(
    "/internal/printer/print",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.payload;
}

export const getPrinters = withHandler(getPrintersFn);
export const printPdf = withHandler(printPdfFn);
