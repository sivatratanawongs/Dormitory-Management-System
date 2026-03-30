import { PrismaClient } from '@prisma/client';
import { IUpdateMeterRequest } from '../interfaces/billing.interface.js';
import { LineService } from './lineService.js';
const prisma = new PrismaClient();

export const BillingService = {

  getLastReadings: async () => {
    const rooms = await prisma.room.findMany({
      include: {
        tenants: {
          where: { status: 'active' },
          take: 1
        },
        billings: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
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
    console.log("📥 ได้รับข้อมูลบิลพร้อมรูปภาพจำนวน:", data.length, "รายการ");

    try {
      // 1. บันทึกข้อมูลลง Database
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
              status: billData.status || "unpaid", // ใช้ status จากหน้าบ้าน
              // หมายเหตุ: หากใน Prisma Schema ยังไม่มีฟิลด์เก็บชื่อไฟล์รูปภาพ 
              // ข้อมูลรูปภาพ (Base64) จะถูกใช้เพื่อส่ง LINE เท่านั้นในขั้นตอนนี้
            },
            include: {
              tenant: {
                select: { lineUserId: true, name: true }
              },
              room: {
                select: { roomNumber: true }
              }
            }
          });
        })
      );

      console.log(`✅ บันทึกบิลลง DB สำเร็จ ${results.length} รายการ`);

    for (let i = 0; i < results.length; i++) {
      const bill = results[i];
      const originalData = data[i];

      if (bill?.tenant?.lineUserId && originalData?.billImageData) {
        console.log(`📡 กำลังส่งบิลรูปภาพไปที่ห้อง ${bill.room.roomNumber}`);
        
        await LineService.sendBillingImage(bill.tenant.lineUserId, {
            roomNumber: bill.room.roomNumber,
            month: bill.month,
            billImageData: originalData.billImageData
        });
      }
      else if (bill?.tenant?.lineUserId) {
        console.log(`⚠️ ไม่พบรูปภาพห้อง ${bill.room?.roomNumber} ส่งแบบ Flex แทน`);
        await LineService.sendBillingFlex(bill.tenant.lineUserId, bill);
      }
    }

      return results;
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดใน createBulkBillings:", error);
      throw error;
    }
  },

  getHistoryByTenant: async (tenantId: string) => {
    return await prisma.billing.findMany({
      where: {
        tenantId: tenantId 
      },
      orderBy: {
        createdAt: 'desc' 
      },
      select: {
        id: true,
        month: true,
        elecUnitPrev: true,
        elecUnitCurr: true,
        waterUnitPrev: true,
        waterUnitCurr: true,
        elecRate: true,
        waterRate: true,
        roomPrice: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        room: {
          select: {
            roomNumber: true
          }
        }
      }
    });
  },
  getHistoryByRoom: async (roomId: string) => {
    return await prisma.billing.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });
  },
};