import { Request, Response } from 'express';
import { BillingService } from '../services/billingService.js';

export const BillingController = {
  getLastReadings: async (req: Request, res: Response) => {
    try {
      const data = await BillingService.getLastReadings();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch last readings", error });
    }
  },
  createBulk: async (req: Request, res: Response) => {
    try {
      const { billings } = req.body;
      const result = await BillingService.createBulkBillings(billings);
      res.status(201).json({ message: "Billings created successfully", result });
    } catch (error) {
      res.status(500).json({ message: "Failed to save billings", error });
    }
  },
  getHistoryByTenant: async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;       
      if (!tenantId || typeof tenantId !== 'string') {
        return res.status(400).json({ 
          message: "Valid Tenant ID is required" 
        });
      }
      const history = await BillingService.getHistoryByTenant(tenantId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch tenant billing history", 
        error 
      });
    }
  },
  getHistoryByRoom : async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      if (!roomId || typeof roomId !== 'string') {
        return res.status(400).json({ message: 'รูปแบบ Room ID ไม่ถูกต้อง' });
      }
      const history = await BillingService.getHistoryByRoom(roomId);
      res.status(200).json(history);
    } catch (error) {
      console.error('Get History By Room Error:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติบิล' });
    }
  },
  updateMeterReading: async (req: Request, res: Response) => {
    try {
      const { roomId, elecReading, waterReading, readingDate, isInitial } = req.body;

      if (!roomId || elecReading === undefined || waterReading === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: "ข้อมูลไม่ครบถ้วน (ต้องการ roomId, elecReading, waterReading)" 
        });
      }
      const result = await BillingService.updateMeterReading({
        roomId,
        elecReading,
        waterReading,
        readingDate,
        isInitial
      });

      res.status(200).json({ 
        success: true, 
        result 
      });
    } catch (error) {
      console.error('Update Meter Error:', error);
      res.status(500).json({ 
        success: false, 
        error 
      });
    }
  },
  getByMonth: async (req: Request, res: Response) => {
    try {
      const { month } = req.params;
      if (!month || Array.isArray(month) || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ message: "รูปแบบเดือนไม่ถูกต้อง (ต้องการ yyyy-MM)" });
      }
      const data = await BillingService.getByMonth(month);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch billing by month", error });
    }
  },
};