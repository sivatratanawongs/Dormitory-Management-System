export interface ILastReading {
  roomId: string;
  roomNumber: string;
  basePrice: number;
  lastElec: number;
  lastWater: number;
  tenantId: string | null;
  tenantName?: string;
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

export type BillingStatus = "pending" | "paid" | "no_tenant" | "cancelled";

export interface ICreateBilling {
  roomId: string;
  tenantId: string | null;
  month: string;
  elecUnitPrev: number;
  elecUnitCurr: number;
  waterUnitPrev: number;
  waterUnitCurr: number;
  roomPrice: number;
  elecRate: number;
  waterRate: number;
  totalAmount: number;
  status: BillingStatus; 
  billImageData?: string | null;
}

export interface BillingRoomState {
  id: string; 
  tenantId: string | null;
  roomNumber: string;
  roomPrice: number;
  prevElec: number;
  currentElec: string;
  prevWater: number;
  currentWater: string;
  tenantName?: string;
}

export interface ITenantBillingHistory extends ICreateBilling {
  id: string;
  createdAt: Date;
  room?: {
    roomNumber: string;
  };
}

export interface IBulkResponse {
  message: string;
  result: {
    count: number;
  };
}