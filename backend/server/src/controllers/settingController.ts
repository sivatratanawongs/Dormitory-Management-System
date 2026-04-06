import { Request, Response } from "express";
import { SettingService } from "../services/settingService.js";
import { ISystemSetting } from "../interfaces/setting.interface.js";

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SettingService.getSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData: ISystemSetting = req.body;

    if (updateData.elecRate < 0 || updateData.waterRate < 0) {
      res.status(400).json({ error: "อัตราค่าบริการห้ามติดลบ" });
      return;
    }

    const updated = await SettingService.updateSettings(updateData);
    res.json(updated);
  } catch (error) {
    console.error(error);
  }
};

export const getPaymentSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const payment = await SettingService.getPaymentSettings();
    res.json(payment);
  } catch (error) {
    console.error(error);
  }
};

export const updatePaymentSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await SettingService.updatePaymentSettings(req.body, req.file); 
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};