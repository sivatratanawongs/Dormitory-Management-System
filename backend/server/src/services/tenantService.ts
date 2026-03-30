import { PrismaClient } from '@prisma/client';
import { ICreateTenantRequest } from '../interfaces/tenant.interface.js';

const prisma = new PrismaClient();

export const TenantService = {
  async createContractTransaction(data: ICreateTenantRequest) {
    return await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tenant.create({
        data: {
          name: data.tenantName,
          nickname: data.nickname,
          idCard: data.idCard,
          phone: data.phone,
          lineId: data.lineId,
          
          address: data.address,
          contractDate: new Date(data.contractDate),
          moveInDate: new Date(data.moveInDate),
          
          emergencyName: data.emergencyName,
          emergencyPhone: data.emergencyPhone,
          contractTerm: data.contractTerm,
          deposit: data.deposit,
          otherNotes: data.otherNotes,
          roomId: data.roomId,
          status: "active"
        }
      });
      
      await tx.room.update({
        where: { id: data.roomId },
        data: { status: "มีผู้เช่า" }
      });

      return newTenant;
    });
  },

  async findAllActive() {
    return await prisma.tenant.findMany({
      where: { status: "active" },
      include: { room: true },
      orderBy: {
        room: { roomNumber: 'asc' }
      }
    });
  },

  async findById(id: string) {
    return await prisma.tenant.findUnique({
      where: { id },
      include: { 
        room: {
          include: { roomType: true }
        }
      }
    });
  },

  async update(id: string, data: any) {
    const { 
      room, 
      createdAt, 
      updatedAt, 
      id: tId, 
      roomId, 
      ...cleanData 
    } = data;

    return await prisma.tenant.update({
      where: { id },
      data: {
        name: cleanData.name,
        nickname: cleanData.nickname,
        idCard: cleanData.idCard,
        phone: cleanData.phone,
        lineId: cleanData.lineId,
        
        // 🚀 อัปเดตฟิลด์ใหม่
        address: cleanData.address,
        contractDate: cleanData.contractDate ? new Date(cleanData.contractDate) : undefined,
        moveInDate: cleanData.moveInDate ? new Date(cleanData.moveInDate) : undefined,
        contractEndDate: cleanData.contractEndDate ? new Date(cleanData.contractEndDate) : undefined,
        
        emergencyName: cleanData.emergencyName,
        emergencyPhone: cleanData.emergencyPhone,
        otherNotes: cleanData.otherNotes,
        contractTerm: 'contractTerm' in cleanData ? Number(cleanData.contractTerm) : undefined,
        deposit: 'deposit' in cleanData ? Number(cleanData.deposit) : undefined,
        status: cleanData.status,
        idCardUrl: 'idCardUrl' in cleanData ? cleanData.idCardUrl : undefined,
        contractFileUrl: 'contractFileUrl' in cleanData ? cleanData.contractFileUrl : undefined,
      }
    });
  },

  async terminateContract(tenantId: string, roomId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenantId },
        data: { 
          status: "inactive",
          contractEndDate: new Date() 
        }
      });

      await tx.room.update({
        where: { id: roomId },
        data: { status: "ว่าง" }
      });
    });
  },

  async handleMoveOut(tenantId: string, roomId: string) {
    return await prisma.$transaction(async (tx) => {
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: { 
          status: "inactive",
          contractEndDate: new Date(),
        }
      });

      await tx.room.update({
        where: { id: roomId },
        data: { status: "ว่าง" }
      });

      return updatedTenant;
    });
  },

  async delete(id: string) {
    return await prisma.tenant.delete({
      where: { id }
    });
  }
};
