import { Request, Response } from 'express';
import { RoomService } from '../services/roomService.js';

export const RoomController = {
  getRooms: async (_req: Request, res: Response) => {
    try {
      const data = await RoomService.findAll();
      res.json(data);
    } catch (error) {
      console.error(error)
    }
  },

  getRoomTypes: async (_req: Request, res: Response) => {
    try {
      const data = await RoomService.findAllTypes();
      res.json(data);
    } catch (error) {
      console.error(error)
    }
  },

  saveRooms: async (req: Request, res: Response) => {
    try {
      await RoomService.updateBulk(req.body);
      res.status(200).json({ message: 'บันทึกข้อมูลสำเร็จ' });
    } catch (error) {
      console.error(error);
    }
  },

  createRoom: async (req: Request, res: Response) => {
    try {
      const newRoom = await RoomService.create(req.body);
      res.status(201).json(newRoom);
    } catch (error) {
      console.error(error);
    }
  },
};