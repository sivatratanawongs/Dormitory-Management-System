import { PrismaClient } from '@prisma/client';
import { IPaymentSetting, ISystemSetting } from '../interfaces/setting.interface.js';

const prisma = new PrismaClient();

export const SettingService = {
  async getSettings(): Promise<ISystemSetting> {
    const config = await prisma.systemSetting.findFirst();
    if (!config) {
      return await prisma.systemSetting.create({
        data: { elecRate: 0, waterRate: 0, waterMinUnit: 0, commonFee: 0 }
      });
    }
    return config;
  },

  async updateSettings(data: ISystemSetting): Promise<ISystemSetting> {
    const config = await prisma.systemSetting.findFirst();
    
    return await prisma.systemSetting.update({
      where: { id: config?.id },
      data: {
        elecRate: Number(data.elecRate),
        waterRate: Number(data.waterRate),
        waterMinUnit: Number(data.waterMinUnit),
        commonFee: Number(data.commonFee),
      },
    });
  },

  async getPaymentSettings(): Promise<IPaymentSetting> {
    const config = await prisma.paymentSetting.findFirst();
    if (!config) {
      return await prisma.paymentSetting.create({
        data: { accountName: null, bankName: null, accountNumber: null, qrCodeUrl: null }
      });
    }
    return config;
  },

  async updatePaymentSettings(data: Partial<IPaymentSetting>): Promise<IPaymentSetting> {
    const config = await prisma.paymentSetting.findFirst();

    return await prisma.paymentSetting.update({
      where: { id: config?.id }, // อัปเดตตาม ID จริงที่เจอใน DB
      data: {
        accountName: data.accountName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ...(data.qrCodeUrl !== undefined && { qrCodeUrl: data.qrCodeUrl }),
      },
    });
  }
};