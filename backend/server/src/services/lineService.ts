import * as line from '@line/bot-sdk';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new line.messagingApi.MessagingApiClient(config);

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001';

export const LineService = {

  sendBillingImage: async (lineUserId: string, data: any) => {
    if (!lineUserId || !data.billImageData) {
      console.log(`⚠️ ข้ามการส่งรูป: ข้อมูลไม่ครบ (Room: ${data.roomNumber})`);
      return;
    }

    try {

      const imageUrl = data.billImageData; 

      console.log(`📡 ส่งรูปจาก Supabase ไปที่ LINE: ${imageUrl}`);
      
      await client.pushMessage({
        to: lineUserId,
        messages: [{
          type: 'image',
          originalContentUrl: imageUrl,
          previewImageUrl: imageUrl
        }]
      });
      
      console.log(`✅ LINE Image sent: Room ${data.roomNumber}`);
    } catch (error: any) {
      // พิมพ์ Error ออกมาดูให้ชัดเจน
      console.error("❌ LINE Image Error Detail:", JSON.stringify(error.body || error.message, null, 2));
    }
  },

  sendBillingFlex: async (lineUserId: string, data: any) => {
    if (!lineUserId) return;

    const elecUsed = Math.max(0, (data.elecUnitCurr || 0) - (data.elecUnitPrev || 0));
    const waterUsed = Math.max(0, (data.waterUnitCurr || 0) - (data.waterUnitPrev || 0));

    const flexMessage: any = {
      type: 'flex',
      altText: `ใบแจ้งค่าเช่าเดือน ${data.month} ห้อง ${data.roomNumber}`,
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#4a8ead",
          contents: [{ type: "text", text: "หอพักบ้านจตุพร", color: "#ffffff", weight: "bold", align: "center" }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: `ห้อง ${data.roomNumber}`, weight: "bold", size: "xl" },
            { type: "separator", margin: "md" },
            { type: "text", text: `ยอดรวมที่ต้องชำระ: ฿${data.totalAmount?.toLocaleString()}`, color: "#ef4444", weight: "bold", margin: "md" }
          ]
        }
      }
    };

    try {
      await client.pushMessage({
        to: lineUserId,
        messages: [flexMessage]
      });
      console.log(`✅ LINE Flex sent: Room ${data.roomNumber}`);
    } catch (error: any) {
      console.error("❌ LINE Flex Error:", error.body || error.message);
    }
  }
};