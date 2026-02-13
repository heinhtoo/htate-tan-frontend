import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import type { APIResponse } from "@/types/response";
import type { CustomerResponse } from "../customer/customer.response";
import type { PaymentTypeResponse } from "../payment-type/payment-type.response";
import type { ProductResponse } from "../product/product.response";

async function getDashboardStatsFn({ from, to }: { from: Date; to: Date }) {
  const response = await axiosClientInstance.get<
    APIResponse<{
      revenue: number;
      debt: number;
      orders: number;
      owned: number;
    }>
  >(
    "/internal/dashboard?from=" +
      from.toLocaleDateString("en-ca") +
      "&to=" +
      to.toLocaleDateString("en-ca"),
  );

  const data = response.data;
  return data.payload;
}

async function getWeeklyStatsFn({ from, to }: { from: Date; to: Date }) {
  const response = await axiosClientInstance.get<
    APIResponse<
      {
        date: string;
        noOfOrders: number;
        noOfRevenues: number;
      }[]
    >
  >(
    "/internal/dashboard/weekly-stats?from=" +
      from.toLocaleDateString("en-ca") +
      "&to=" +
      to.toLocaleDateString("en-ca"),
  );

  const data = response.data;
  return data.payload;
}

async function getDebtFn({ from, to }: { from: Date; to: Date }) {
  const response = await axiosClientInstance.get<
    APIResponse<
      {
        customer: CustomerResponse;
        amount: number;
        totalOrders: number[];
      }[]
    >
  >(
    "/internal/dashboard/debts?from=" +
      from.toLocaleDateString("en-ca") +
      "&to=" +
      to.toLocaleDateString("en-ca"),
  );

  const data = response.data;
  return data.payload;
}

async function getLowStocksFn({ from, to }: { from: Date; to: Date }) {
  const response = await axiosClientInstance.get<
    APIResponse<
      {
        product: ProductResponse;
        stockLevel: number;
        stockLimit: number;
      }[]
    >
  >(
    "/internal/dashboard/low-stocks?from=" +
      from.toLocaleDateString("en-ca") +
      "&to=" +
      to.toLocaleDateString("en-ca"),
  );

  const data = response.data;
  return data.payload;
}

async function getPaymentsFn({ from, to }: { from: Date; to: Date }) {
  const response = await axiosClientInstance.get<
    APIResponse<
      {
        paymentMethod: PaymentTypeResponse;
        amount: number;
        noOfOrders: number;
      }[]
    >
  >(
    "/internal/dashboard/payments?from=" +
      from.toLocaleDateString("en-ca") +
      "&to=" +
      to.toLocaleDateString("en-ca"),
  );

  const data = response.data;
  return data.payload;
}

export const getDashboardStats = withHandler(getDashboardStatsFn);
export const getWeeklyStats = withHandler(getWeeklyStatsFn);
export const getDebt = withHandler(getDebtFn);
export const getLowStocks = withHandler(getLowStocksFn);
export const getPayments = withHandler(getPaymentsFn);
