export interface ITenant {
  id: string;
  name: string;
  nickname?: string;
  phone: string;
  lineId?: string;
  idCard?: string;
  
  address?: string;
  contractDate: string | Date;
  moveInDate: string | Date;
  contractEndDate?: string | Date;
  
  emergencyName?: string;
  emergencyPhone?: string;
  contractTerm: number;
  deposit: number;
  otherNotes?: string;
  status: string;
  roomId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  idCardUrl?: string; 
  contractFileUrl?: string;
}

export interface ICreateTenantRequest {
  roomId: string;
  tenantName: string;
  nickname?: string;
  idCard?: string;
  phone: string;
  lineId?: string;
  
  address?: string;
  contractDate: string;
  moveInDate: string;
  
  emergencyName?: string;
  emergencyPhone?: string;
  contractTerm: number;
  deposit: number;
  otherNotes?: string;
}
export interface IMoveOutRequest {
  roomId: string;
  moveOutDate?: string; 
}

export interface IMoveOutResponse {
  success: boolean;
  message: string;
  data?: any;
}