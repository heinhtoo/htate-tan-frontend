export type OrderItemResponse = {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
};

export type OtherChargeResponse = {
  id: number;
  otherChargeId: number;
  name: string;
  amount: number;
};

export type PaymentResponse = {
  id: number;
  typeId: number;
  type: string;
  amount: number;
  status: string;
  referenceId?: string;
};

export type OrderResponse = {
  id: number;

  customer?: {
    id: string;
    name: string;
    address: string;
    state: string;
  };

  warehouse: {
    id: number;
    name: string;
  };

  carGate?: {
    id: number;
    name: string;
  };

  status: string;
  remark?: string;

  totals: {
    orderAmount: number;
    otherCharges: number;
    orderDiscount: number;
    additionalDiscount: number;
    payable: number;
  };

  items: OrderItemResponse[];
  otherCharges: OtherChargeResponse[];
  payments: PaymentResponse[];

  receiptNo?: string;

  createdAt: Date;
};

export enum OrderStatus {
  Success = "Success",
  Cancelled = "Cancelled",
  Pending = "Pending",
  Paid = "Paid",
  PartialPaid = "Partial Paid",
}
