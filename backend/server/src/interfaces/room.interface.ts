import { ITenant } from "./tenant.interface.js";

export interface IRoomType {
  id: string;
  name: string;
}

export interface IRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  basePrice: number;
  description?: string;
  status: string;
  tenants: ITenant[];
  roomType?: IRoomType;

}

export interface ICreateRoomInput {
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  basePrice: number;
  description?: string;
}