// src/routes/lineRoutes.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { messagingApi } from '@line/bot-sdk';

const router = express.Router();
const prisma = new PrismaClient();

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
});

router.post('/webhook', async (req, res) => {
  const events = req.body.events;

  if (!events || events.length === 0) {
    return res.status(200).send('OK');
  }

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const replyToken = event.replyToken;
      const userId = event.source.userId;
      const userText = event.message.text.trim();

      // ตรวจสอบว่าขึ้นต้นด้วยคำว่า "ห้อง" หรือไม่
      if (userText.startsWith('ห้อง')) {
        // ดึงเอาเฉพาะเลขห้องออกมา (ตัดคำว่า ห้อง ออกไป)
        const roomNum = userText.replace('ห้อง', '').trim();

        try {
          // 1. ค้นหาผู้เช่าที่อยู่ห้องนั้น และสถานะต้องเป็น active เท่านั้น
          const tenant = await prisma.tenant.findFirst({
            where: {
              room: { roomNumber: roomNum },
              status: "active"
            },
            include: { room: true }
          });

          if (tenant) {
            // 2. บันทึก lineUserId ลงในตาราง Tenant
            await prisma.tenant.update({
              where: { id: tenant.id },
              data: { lineUserId: userId }
            });

            // 3. ตอบกลับยืนยันความสำเร็จ
            await client.replyMessage({
              replyToken: replyToken,
              messages: [{
                type: 'text',
                text: `✅ ผูกข้อมูลสำเร็จ!\nคุณได้ลงทะเบียนรับแจ้งเตือนสำหรับ "ห้อง ${roomNum}" เรียบร้อยแล้วค่ะ`
              }]
            });
            
            console.log(`🔗 Linked: Room ${roomNum} with UserID ${userId}`);
          } else {
            // กรณีไม่เจอผู้เช่า หรือห้องนั้นยังไม่มีคนเช่า (status ไม่ใช่ active)
            await client.replyMessage({
              replyToken: replyToken,
              messages: [{
                type: 'text',
                text: `❌ ไม่พบข้อมูลผู้เช่าใน "ห้อง ${roomNum}"\nกรุณาตรวจสอบเลขห้อง หรือติดต่อเจ้าหน้าที่ค่ะ`
              }]
            });
          }
        } catch (error) {
          console.error("Database Error:", error);
          // ตอบกลับกรณีระบบขัดข้อง
          await client.replyMessage({
            replyToken: replyToken,
            messages: [{
              type: 'text',
              text: "⚠️ เกิดข้อผิดพลาดในระบบฐานข้อมูล กรุณาลองใหม่ภายหลังค่ะ"
            }]
          });
        }
      }
    }
  }

  return res.status(200).send('OK');
});

export default router;