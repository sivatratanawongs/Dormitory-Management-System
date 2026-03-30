import type { ICreateRoomInput, IRoom, IRoomType, IUpdateRoomInput } from "../type/room";
import axios from 'axios';

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

const API_BASE_URL = 'http://localhost:5001/api/settings'; 
const API_BASE = "http://localhost:5001/api/rooms";

export const SettingService = {

  // --- ส่วนของค่าน้ำ/ไฟ (System Settings) ---
  getSettings: async (): Promise<ISystemSetting> => {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลค่าน้ำไฟได้');
    return response.json();
  },

  updateSettings: async (data: ISystemSetting): Promise<ISystemSetting> => {
    const response = await fetch(`${API_BASE_URL}/system`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('อัปเดตข้อมูลค่าน้ำไฟไม่สำเร็จ');
    return response.json();
  },

  // --- ส่วนของบัญชีธนาคาร (Payment Settings) ---
  getPaymentSettings: async (): Promise<IPaymentSetting> => {
    const response = await fetch(`${API_BASE_URL}/payment`);
    if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลบัญชีธนาคารได้');
    return response.json();
  },

  updatePaymentSettings: async (formData: FormData): Promise<IPaymentSetting> => {
    const response = await fetch(`${API_BASE_URL}/payment`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) throw new Error('อัปเดตข้อมูลบัญชีไม่สำเร็จ');
    return response.json();
  },

  getRooms: async (): Promise<IRoom[]> => {
    const response = await axios.get<IRoom[]>(API_BASE);
    return response.data;
  },

  getRoomTypes: async (): Promise<IRoomType[]> => {
    const response = await axios.get<IRoomType[]>(`${API_BASE}/types`); 
    return response.data;
  },

  addRoom: async (data: ICreateRoomInput): Promise<IRoom> => {
    const response = await axios.post<IRoom>(API_BASE, data);
    return response.data;
  },

  updateBulkRooms: async (rooms: IUpdateRoomInput[]): Promise<{ message: string }> => {
    const response = await axios.put<{ message: string }>(`${API_BASE}/bulk`, rooms);
    return response.data;
  }
  
};