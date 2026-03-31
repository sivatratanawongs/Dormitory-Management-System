import { PrismaClient } from '@prisma/client';
import { IPaymentSetting, ISystemSetting } from '../interfaces/setting.interface.js';
import { createClient } from '@supabase/supabase-js';

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
    const config = await prisma.paymentSetting.findFirst();
    let qrUrl = data.qrCodeUrl;

    // 📸 ถ้ามีการส่งไฟล์รูปมา ให้จัดการส่งขึ้น Supabase Storage
    if (file) {
      const fileName = `qr-${Date.now()}.jpg`;
      
      const { data: uploadData, error } = await supabase.storage
        .from('qrcodes') // ชื่อ Bucket ที่คุณสร้าง
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) throw new Error(error.message);

      // ดึง Public URL มาเก็บในฐานข้อมูล
      const { data: { publicUrl } } = supabase.storage
        .from('qrcodes')
        .getPublicUrl(fileName);
      
      qrUrl = publicUrl;
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