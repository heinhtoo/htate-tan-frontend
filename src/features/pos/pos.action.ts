import { withHandler } from "@/lib/actionHelper";
import axiosClientInstance from "@/lib/axiosClientInstance";
import { addExtraData } from "@/lib/axiosHelper";
import type { APIResponse } from "@/types/response";
import type { CustomerResponse } from "../customer/customer.response";
import type { OrderResponse } from "./pos.response";

async function createPOSOrderFn({
  cart,
  selectedCustomer,
  carGateId,
  otherCharges,
  remark,
  payment,
  isCustomer,
  globalDiscount
}: {
  cart: { id: number; price: number; qty: number }[];
  selectedCustomer: CustomerResponse | null;
  carGateId?: number;
  remark?: string;
  otherCharges?: { otherChargeId: number; amount: number; name: string }[];
  payment: {
    paymentMethodId: number;
    amount: number;
    referenceId?: string | undefined;
    name: string;
  }[];
  isCustomer: boolean;
  globalDiscount: number
}) {
  const response = await axiosClientInstance.post<APIResponse<OrderResponse>>(
    "/common/pos?isCustomer=" + (isCustomer ? "1" : "0"),
    addExtraData({
      items: cart.map((item) => {
        return {
          productId: item.id,
          quantity: item.qty,
          unitPrice: item.price,
        };
      }),
      customerId: selectedCustomer?.id,
      carGateId,
      remark,
      payment: payment.map((item) => {
        return {
          paymentMethodId: item.paymentMethodId,
          amount: item.amount,
          referenceId: item.referenceId,
        };
      }),
      otherCharges: otherCharges?.map((item) => {
        return {
          otherChargeId: item.otherChargeId,
          amount: item.amount,
        };
      }),
      globalDiscount
    })
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;
  return { isSuccess, result };
}

export const createPOSOrder = withHandler(createPOSOrderFn);

async function confirmPOSOrderFn({
  id,
  data,
}: {
  id: number;
  data: {
    payment: {
      paymentId?: number;
      paymentMethodId: number;
      amount: number;
      referenceId?: string | undefined;
      name: string;
    }[];
  };
}) {
  const response = await axiosClientInstance.put<APIResponse<OrderResponse>>(
    "/common/pos/" + id + "/confirm",
    addExtraData({
      payment: data.payment.map((item) => {
        return {
          paymentId: item.paymentId,
          paymentMethodId: item.paymentMethodId,
          amount: item.amount,
          referenceId: item.referenceId,
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

export const confirmPOSOrder = withHandler(confirmPOSOrderFn);

async function cancelPOSOrderFn({ id }: { id: number }) {
  const response = await axiosClientInstance.put<APIResponse<OrderResponse>>(
    "/common/pos/" + id + "/cancel"
  );

  let isSuccess = false;
  if (response.status >= 200 && response.status < 300) {
    isSuccess = true;
  }

  const result = response.data;

  return { isSuccess, result };
}

export const cancelPOSOrder = withHandler(cancelPOSOrderFn);
