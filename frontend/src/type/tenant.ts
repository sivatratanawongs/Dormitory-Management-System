import type { ElementType } from "react";

export interface ITenant {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  nickname: string | null;
  idCard: string | null;
  phone: string;
  lineId: string | null;

  address: string | null;
  
  contractDate: string;
  moveInDate: string;
  contractEndDate: string | null;
  
  emergencyName: string | null;
  emergencyPhone: string | null;
  contractTerm: number | null;
  deposit: number | null;
  otherNotes: string | null;
  roomId: string;
  idCardUrl?: string; 
  contractFileUrl?: string;
}

export interface ICreateContractRequest extends Omit<ITenant, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'contractEndDate' | 'name'> {
  tenantName: string; 
}

export interface IApiResponse<T = ITenant> {
  success: boolean;
  message?: string;
  data?: T | null;
}

export interface DetailItemProps {
  label: string;
  value: string | number | Date | null | undefined;
  highlight?: boolean;
  isEditing?: boolean;
  type?: 'text' | 'number' | 'date';
  onChange?: (val: string) => void;
}

export interface DocumentItemProps {
  label: string;
  icon: ElementType;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hasFile: boolean;
  isLoading?: boolean;
}

export interface ContractTemplateProps {
  data: {
    name: string;
    address: string | null;
    contractDate: string;
    moveInDate: string;
    contractEndDate: string;
    contractTerm: number | null;
    deposit: number | null;
  };
  roomNumber: string;
  price: number;
  floor: string | number;
}

export interface IMoveOutRequest {
  roomId: string;
  moveOutDate?: string;
  reason?: string;
}

export interface IMoveOutResponse {
  success: boolean;
  message: string;
  data?: ITenant;
}