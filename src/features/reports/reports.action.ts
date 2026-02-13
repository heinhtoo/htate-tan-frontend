import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import type { APIResponse } from "@/types/response";
import type { FinancialReportResponse } from "./reports.response";

async function getFinancialReportFn({ from, to }: { from: Date; to: Date }) {
  const response = await axiosClientInstance.get<
    APIResponse<FinancialReportResponse[]>
  >(
    "/internal/reports/financial?from=" +
      from.toLocaleDateString("en-ca") +
      "&to=" +
      to.toLocaleDateString("en-ca"),
  );

  const data = response.data;
  return data.payload;
}

export const getFinancialReport = withHandler(getFinancialReportFn);
