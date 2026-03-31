import api from './api'; 
import axios from 'axios'; 
import type { ICreateContractRequest, IApiResponse, ITenant } from '../type/tenant';

const API_PATH = '/api/tenants'; 

export const TenantFrontendService = {

  getAllActiveTenants: async (): Promise<IApiResponse<ITenant[]>> => {
    try {
      const response = await api.get<IApiResponse<ITenant[]>>(API_PATH);
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, 'ไม่สามารถโหลดรายชื่อผู้เช่าได้');
    }
  },

  getTenantDetail: async (id: string): Promise<IApiResponse<ITenant>> => {
    try {
      const response = await api.get<IApiResponse<ITenant>>(`${API_PATH}/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, 'ไม่สามารถโหลดข้อมูลผู้เช่ารายนี้ได้');
    }
  },

  createContract: async (contractData: ICreateContractRequest): Promise<IApiResponse<ITenant>> => {
    try {
      const response = await api.post<IApiResponse<ITenant>>(
        `${API_PATH}/contract`, 
        contractData
      );
      return response.data;
    } catch (error: unknown) {
        throw handleAxiosError(error, 'เกิดข้อผิดพลาดในการบันทึกสัญญา');
      }
    },

  updateTenant: async (id: string, tenantData: Partial<ITenant>): Promise<IApiResponse<ITenant>> => {
    try {
      const response = await api.patch<IApiResponse<ITenant>>(
        `${API_PATH}/${id}`, 
        tenantData
      );
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, 'ไม่สามารถอัปเดตข้อมูลผู้เช่าได้');
    }
  },

  deleteFile: async (id: string, fileType: 'idCard' | 'contract'): Promise<IApiResponse<void>> => {
    try {
      const response = await api.delete<IApiResponse<void>>(`${API_PATH}/${id}/file`, {
        data: { fileType }
      });
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, 'ไม่สามารถลบไฟล์ได้');
    }
  },

  uploadFile: async (id: string, file: File, fileType: 'idCard' | 'contract'): Promise<IApiResponse<ITenant>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      const response = await api.post<IApiResponse<ITenant>>(
        `${API_PATH}/${id}/upload`,
        formData
      );
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, 'ไม่สามารถอัปโหลดไฟล์ได้');
    }
  },

  moveOut: async (
    id: string, 
    moveOutData: { roomId: string; moveOutDate?: string } 
  ): Promise<IApiResponse<void>> => {
    try {
      const response = await api.post<IApiResponse<void>>(
        `${API_PATH}/${id}/move-out`, 
        moveOutData 
      );
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, 'ไม่สามารถบันทึกการแจ้งย้ายออกได้');
    }
  },
}

const handleAxiosError = (error: unknown, defaultMessage: string): Error => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    return new Error(serverMessage || defaultMessage);
  }
  return new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
};