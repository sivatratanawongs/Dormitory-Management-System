export interface ICreateBilling {
  roomId: string;
  tenantId: string; 
  month: string;
  elecUnitPrev: number;
  elecUnitCurr: number;
  waterUnitPrev: number;
  waterUnitCurr: number;
  roomPrice: number;
  totalAmount: number;
  status?: string;
  billImageData?: string | null;
}

export interface IBulkBillingRequest {
  billings: ICreateBilling[];
}

export interface IUpdateMeterRequest {
  roomId: string;
  elecReading: number;
  waterReading: number;
  readingDate: string; 
  isInitial?: boolean;
}

export interface IUpdateMeterResponse {
  success: boolean;
  message: string;
}