import { PrismaClient } from '@prisma/client';
import { IPaymentSetting, ISystemSetting } from '../interfaces/setting.interface.js';
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
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

  async updatePaymentSettings(data: any, file?: Express.Multer.File): Promise<IPaymentSetting> {
    console.log("--- เริ่มการอัปเดตใน Service ---");
    console.log("ไฟล์ที่รับมา:", file ? file.originalname : "ไม่มีไฟล์");

    const config = await prisma.paymentSetting.findFirst();
    let qrUrl = config?.qrCodeUrl;

    if (file) {
      const fileName = `qr-${Date.now()}${path.extname(file.originalname)}`;
      
      const { error } = await supabase.storage
        .from('qrcodes') 
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('qrcodes')
        .getPublicUrl(fileName);
      
      qrUrl = publicUrl;
      console.log("URL ใหม่ที่ได้จาก Supabase:", qrUrl);
    }

    return await prisma.paymentSetting.update({
      where: { id: config?.id },
      data: {
        accountName: data.accountName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        qrCodeUrl: qrUrl,
      },
    });
  }
};