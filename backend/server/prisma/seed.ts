import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('เริ่มการ Seed ข้อมูล...')
  

  const roomTypes = [
    { name: 'ห้องพัดลม' },
    { name: 'ห้องแอร์' },
  ]

  for (const type of roomTypes) {
    await prisma.roomType.upsert({
      where: { name: type.name },
      update: {},
      create: {
        name: type.name,
      },
    })
  }

  console.log('Seed ข้อมูลประเภทห้องสำเร็จ!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })