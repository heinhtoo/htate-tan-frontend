import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse, APIViaIndexResponse } from "@/types/response";
import type { OrderResponse } from "./order.response";

async function getOrderStatsFn({
  dateFilter,
  from,
  to,
}: {
  dateFilter: string;
  from?: string;
  to?: string;
}) {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("dateFilter", dateFilter);
  if (from) {
    urlSearchParams.append("from", from);
  }
  if (to) {
    urlSearchParams.append("to", to);
  }
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
}: {
  dateFilter: string;
  from?: string;
  to?: string;
  after?: number;
  size: string;
  q?: string;
  status?: string;
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
      otherOrderChargeId?: number;
      otherChargeId: number;
      amount: number;
    }[];
  };
}) {
  const response = await axiosClientInstance.put<APIResponse<OrderResponse>>(
    "/common/pos/" + id,
    addExtraData({
      ...data,
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
