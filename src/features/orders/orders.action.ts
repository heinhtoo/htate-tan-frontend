import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse, APIViaIndexResponse } from "@/types/response";
import type { OrderResponse } from "./order.response";

async function getOrderStatsFn({
  dateFilter,
  from,
  to,
  isCustomer,
}: {
  dateFilter: string;
  from?: string;
  to?: string;
  isCustomer: boolean;
}) {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("dateFilter", dateFilter);
  if (from) {
    urlSearchParams.append("from", from);
  }
  if (to) {
    urlSearchParams.append("to", to);
  }
  urlSearchParams.append("isCustomer", isCustomer ? "1" : "0");
  const response = await axiosClientInstance.get<
    APIViaIndexResponse<{
      totalOrders: number;
      totalPendingOrders: number;
      totalPaidOrders: number;
      totalUnpaidOrders: number;
      totalRevenue: number;
      totalPendingRevenue: number;
      totalUnpaidRevenue: number;
      totalPaidRevenue: number;
    }>
  >("/common/pos/stats?" + urlSearchParams.toString());

  const data = response.data;
  return { data: data.payload, pagination: data.pagination };
}

async function getOrdersFn({
  after,
  size = "5",
  q,
  dateFilter,
  from,
  to,
  status,
  isCustomer,
}: {
  dateFilter: string;
  from?: string;
  to?: string;
  after?: number;
  size: string;
  q?: string;
  status?: string;
  isCustomer: boolean;
}) {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("dateFilter", dateFilter);
  if (from) {
    urlSearchParams.append("from", from);
  }
  if (to) {
    urlSearchParams.append("to", to);
  }
  if (status) {
    urlSearchParams.append("status", status);
  }
  urlSearchParams.append("isCustomer", isCustomer ? "1" : "0");

  const response = await axiosClientInstance.get<
    APIViaIndexResponse<OrderResponse[]>
  >(
    "/common/pos?pageSize=" +
      size +
      (after ? "&after=" + after : "") +
      (q ? "&q=" + q : "") +
      "&" +
      urlSearchParams.toString()
  );

  const data = response.data;
  return { data: data.payload, pagination: data.pagination };
}

async function getOrderDetailsFn({ slug }: { slug: string }) {
  const response = await axiosClientInstance.get<APIResponse<OrderResponse>>(
    "/common/pos/" + slug
  );

  const data = response.data;
  return { data: data.payload };
}

async function updateOrderFn({
  id,
  data,
}: {
  id: number;
  data: {
    carGateId?: number;
    remark?: string;
    totalAdditionalDiscountAmount?: number;
    updatedItems: {
      orderItemId?: number;
      productId: number;
      quantity: number;
      unitPrice: number;
      discountAmount: number;
    }[];
    otherCharges: {
      id?: number;
      otherOrderChargeId?: number;
      otherChargeId: number;
      amount: number;
    }[];
    payment: {
      paymentId?: number;
      paymentMethodId: number;
      amount: number;
      referenceId?: string | undefined;
      name: string;
      status: string;
    }[];
  };
}) {
  const response = await axiosClientInstance.put<APIResponse<OrderResponse>>(
    "/common/pos/" + id,
    addExtraData({
      ...data,
      otherCharges: data.otherCharges?.map((item) => {
        return {
          otherChargeId: item.otherChargeId,
          amount: item.amount,
        };
      }),
      payment: data.payment.map((item) => {
        return {
          paymentId: item.paymentId,
          paymentMethodId: item.paymentMethodId,
          amount: item.amount,
          referenceId: item.referenceId,
          status: item.status,
        };
      }),
    })
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const getOrders = withHandler(getOrdersFn);
export const updateOrder = withHandler(updateOrderFn);
export const getOrderStats = withHandler(getOrderStatsFn);
export const getOrderDetails = withHandler(getOrderDetailsFn);
