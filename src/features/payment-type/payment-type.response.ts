export type PaymentTypeResponse = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  accountNo: string;
  showQR: boolean;
  showValue: boolean;
  version: number;
  imagePath: string;
  qrPath: string;
  commission: number;
};
