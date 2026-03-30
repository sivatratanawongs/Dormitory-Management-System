import type { ITenant } from "./tenant";

export interface IRoomType {
  id: string;
  name: string;
}

export interface IRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  roomType?: IRoomType;
  basePrice: number;
  description: string | null;
  status: 'ว่าง' | 'มีผู้เช่า';
  createdAt?: string;
  updatedAt?: string;
  tenants: ITenant[] 
}

export interface ICreateRoomInput {
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  basePrice: number;
  description?: string;
}

export interface IUpdateRoomInput {
  id: string;
  roomNumber?: string;
  floor?: number;
  roomTypeId: string;
  basePrice: number;
  description?: string | null;
}