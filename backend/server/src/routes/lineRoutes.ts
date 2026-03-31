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
  if (!events) return res.status(200).send('OK');

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const { replyToken } = event;
      const userId = event.source.userId;
      const userText = event.message.text.trim().toUpperCase(); 

      let roomNum = userText;
      if (userText.startsWith('ห้อง')) {
        roomNum = userText.replace('ห้อง', '').trim();
      }

      if (roomNum.match(/^N\d+/)) { 
        try {
          const tenant = await prisma.tenant.findFirst({
            where: {
              room: {
                roomNumber: roomNum 
              },
              status: "active"
            },
            include: { room: true }
          });

          if (tenant) {
            await prisma.tenant.update({
              where: { id: tenant.id },
              data: { lineUserId: userId }
            });

            await client.replyMessage({
              replyToken,
              messages: [{
                type: 'text',
                text: `✅ ผูกข้อมูลสำเร็จ!\nห้อง ${roomNum} เชื่อมต่อกับ LINE เรียบร้อยแล้วค่ะ`
              }]
            });
            console.log(`Successfully linked User: ${userId} to Room: ${roomNum}`);
          } else {
            // หาไม่เจอ
            await client.replyMessage({
              replyToken,
              messages: [{
                type: 'text',
                text: `❌ ไม่พบผู้เช่าในห้อง "${roomNum}" ที่กำลังพักอยู่\nกรุณาตรวจสอบเลขห้องอีกครั้งค่ะ`
              }]
            });
          }
        } catch (error) {
          console.error("Webhook Error:", error);
        }
      }
    }
  }
  return res.status(200).send('OK');
});

export default router;