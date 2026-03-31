import { PrismaClient } from '@prisma/client';
import { IUpdateMeterRequest } from '../interfaces/billing.interface.js';
import { LineService } from './lineService.js';
import { supabase } from '../config/supabase.js'; 

const prisma = new PrismaClient();


async function uploadToSupabase(base64Data: string, roomNumber: string): Promise<string | null> {
  try {
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, 'base64');

    const fileName = `bills/room-${roomNumber}-${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('qrcodes')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('qrcodes')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    console.error(`❌ Upload Error (Room ${roomNumber}):`, err);
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
        month: "START",
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
            },
            include: {
              tenant: { select: { lineUserId: true, name: true } },
              room: { select: { roomNumber: true } }
            }
          });
        })
      );


      for (let i = 0; i < results.length; i++) {
        const bill = results[i];
        const originalData = data[i];

        if (bill?.tenant?.lineUserId && originalData?.billImageData) {
          
          const publicImageUrl = await uploadToSupabase(originalData.billImageData, bill.room.roomNumber);

          if (publicImageUrl) {
            await LineService.sendBillingImage(bill.tenant.lineUserId, {
              roomNumber: bill.room.roomNumber,
              month: bill.month,
              billImageData: publicImageUrl 
            });
          } else {
            await LineService.sendBillingFlex(bill.tenant.lineUserId, bill);
          }
        } 
        else if (bill?.tenant?.lineUserId) {
          await LineService.sendBillingFlex(bill.tenant.lineUserId, bill);
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