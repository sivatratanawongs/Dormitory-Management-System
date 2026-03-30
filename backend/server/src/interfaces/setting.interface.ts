export interface ISystemSetting {
  id?: string;
  elecRate: number;
  waterRate: number;
  waterMinUnit: number;
  commonFee: number;
  updatedAt?: Date;
}


export interface IPaymentSetting {
  id?: string;
  accountName: string | null;
  bankName: string | null;
  accountNumber: string | null;
  qrCodeUrl: string | null;
  updatedAt?: Date;
}