import { PrismaClient } from '@prisma/client';
import { ICreateRoomInput, IRoom } from '../interfaces/room.interface.js';

const prisma = new PrismaClient();

export const RoomService = {
  async findAll() {
    return await prisma.room.findMany({
      include: { 
        roomType: true,
        tenants: {
          where: { status: 'active' }
        }
      },
      orderBy: [
        { floor: 'asc' },
        { roomNumber: 'asc' }
      ],
    });
  },

  async findAllTypes() {
    return await prisma.roomType.findMany();
  },

  async create(data: ICreateRoomInput) {
    return await prisma.room.create({
      data: {
        roomNumber: data.roomNumber,
        floor: data.floor,
        roomTypeId: data.roomTypeId,
        basePrice: data.basePrice,
        description: data.description,
      },
    });
  },

  async updateBulk(rooms: IRoom[]) {
    const transactions = rooms.map((room) =>
      prisma.room.update({
        where: { id: room.id },
        data: {
          roomNumber: room.roomNumber,
          floor: room.floor,
          roomTypeId: room.roomTypeId,
          basePrice: room.basePrice,
          description: room.description,
        },
      })
    );
    return await prisma.$transaction(transactions);
  },
  
};