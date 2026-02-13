export type FinancialReportOrderSummary = {
  id: number;
  receiptNo?: string;
  customerName?: string;
  totalAmount: number;
  amountAffected: number; // For payments, its the amount paid. For unpaid, its the remaining debt.
};

export type FinancialReportPaymentMethodSummary = {
  methodName: string;
  totalAmount: number;
  orders: FinancialReportOrderSummary[];
};

export type FinancialReportUnpaidSummary = {
  totalAmount: number;
  orders: FinancialReportOrderSummary[];
};

export type FinancialReportResponse = {
  date: string;
  paymentMethods: FinancialReportPaymentMethodSummary[];
  unpaid: FinancialReportUnpaidSummary;
};
