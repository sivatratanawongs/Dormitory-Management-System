import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { IUpdateMeterRequest } from '../interfaces/billing.interface.js';
import { LineService } from './lineService.js';
import { supabase } from '../config/supabase.js'; 

const prisma = new PrismaClient();

async function uploadToSupabase(base64Data: string, roomNumber: string): Promise<string | null> {
  try {
    if (!base64Data?.includes('base64,')) {
      return null;
    }

    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) return null;

    const inputBuffer = Buffer.from(base64Image, 'base64');

    const compressedBuffer = await sharp(inputBuffer)
      .png({ 
        palette: true,
        compressionLevel: 9
      })
      .toBuffer();

    const fileName = `bills/room-${roomNumber}-${Date.now()}.png`;

    const { error } = await supabase.storage
      .from('qrcodes')
      .upload(fileName, compressedBuffer, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('qrcodes')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    console.error("❌ Sharp/Upload Error:", err);
    return null;
  }
}

export const BillingService = {
  getLastReadings: async () => {
    const rooms = await prisma.room.findMany({
      include: {
        tenants: { where: { status: 'active' }, take: 1 },
        billings: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    return rooms.map(room => ({
      roomId: room.id,
      roomNumber: room.roomNumber,
      basePrice: room.basePrice,
      tenantId: room.tenants[0]?.id || null,
      tenantName: room.tenants[0]?.name || 'ห้องว่าง',
      lastElec: room.billings[0]?.elecUnitCurr || 0,
      lastWater: room.billings[0]?.waterUnitCurr || 0,
    }));
  },

  updateMeterReading: async (data: IUpdateMeterRequest) => {
    return await prisma.billing.create({
      data: {
        roomId: data.roomId,
        month: "เริ่มต้น",
        elecUnitPrev: data.elecReading,
        elecUnitCurr: data.elecReading,
        waterUnitPrev: data.waterReading,
        waterUnitCurr: data.waterReading,
        roomPrice: 0,
        elecRate: 8,
        waterRate: 25,
        totalAmount: 0,
        status: "paid",
      }
    });
  },

  createBulkBillings: async (data: any[]) => {
    try {
      const results = await Promise.all(
        data.map(async (billData) => {
          let finalImageUrl = null;

          if (billData.billImageData) {
            finalImageUrl = await uploadToSupabase(billData.billImageData, billData.roomNumber);
          }

          return await prisma.billing.create({
            data: {
              roomId: billData.roomId,
              tenantId: billData.tenantId,
              month: billData.month,
              elecUnitPrev: billData.elecUnitPrev,
              elecUnitCurr: billData.elecUnitCurr,
              waterUnitPrev: billData.waterUnitPrev,
              waterUnitCurr: billData.waterUnitCurr,
              elecRate: billData.elecRate,
              waterRate: billData.waterRate,
              roomPrice: billData.roomPrice,
              totalAmount: billData.totalAmount,
              status: billData.status || "unpaid",
              billImageUrl: finalImageUrl,
            },
            include: {
              tenant: { select: { lineUserId: true } },
              room: { select: { roomNumber: true } }
            }
          });
        })
      );

      for (const bill of results) {
        const currentBill = bill as any; 

        if (currentBill.tenant?.lineUserId && currentBill.billImageUrl) {
          await LineService.sendBillingImage(currentBill.tenant.lineUserId, {
            roomNumber: currentBill.room?.roomNumber || 'N/A',
            month: currentBill.month,
            billImageData: currentBill.billImageUrl 
          });
        }
      }
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getHistoryByTenant: async (tenantId: string) => {
    return await prisma.billing.findMany({
      where: { tenantId: tenantId },
      orderBy: { createdAt: 'desc' },
      include: { room: { select: { roomNumber: true } } }
    });
  },

  getHistoryByRoom: async (roomId: string) => {
    return await prisma.billing.findMany({
      where: { roomId: roomId },
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { name: true } } }
    });
  },
};