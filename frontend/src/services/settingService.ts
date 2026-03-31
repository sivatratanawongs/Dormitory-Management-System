import api from './api'; 
import type { ICreateRoomInput, IRoom, IRoomType, IUpdateRoomInput } from "../type/room";

export interface ISystemSetting {
  id?: string;
  elecRate: number;
  waterRate: number;
  waterMinUnit: number;
  commonFee: number;
}

export interface IPaymentSetting {
  id?: number;
  accountName: string | null;
  bankName: string | null;
  accountNumber: string | null;
  qrCodeUrl: string | null;
}

const SETTINGS_PATH = '/api/settings'; 
const ROOMS_PATH = "/api/rooms";

export const SettingService = {

  getSettings: async (): Promise<ISystemSetting> => {
    const response = await api.get<ISystemSetting>(SETTINGS_PATH);
    return response.data;
  },

  updateSettings: async (data: ISystemSetting): Promise<ISystemSetting> => {
    const response = await api.put<ISystemSetting>(`${SETTINGS_PATH}/system`, data);
    return response.data;
  },

  getPaymentSettings: async (): Promise<IPaymentSetting> => {
    const response = await api.get<IPaymentSetting>(`${SETTINGS_PATH}/payment`);
    return response.data;
  },

  updatePaymentSettings: async (formData: FormData): Promise<IPaymentSetting> => {
    const response = await api.put<IPaymentSetting>(`${SETTINGS_PATH}/payment`, formData);
    return response.data;
  },

  getRooms: async (): Promise<IRoom[]> => {
    const response = await api.get<IRoom[]>(ROOMS_PATH);
    return response.data;
  },

  getRoomTypes: async (): Promise<IRoomType[]> => {
    const response = await api.get<IRoomType[]>(`${ROOMS_PATH}/types`); 
    return response.data;
  },

  addRoom: async (data: ICreateRoomInput): Promise<IRoom> => {
    const response = await api.post<IRoom>(ROOMS_PATH, data);
    return response.data;
  },

  updateBulkRooms: async (rooms: IUpdateRoomInput[]): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`${ROOMS_PATH}/bulk`, rooms);
    return response.data;
  }
  
};