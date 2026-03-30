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
      // 1. บันทึกไฟล์รูป
      const base64Data = data.billImageData.replace(/^data:image\/jpeg;base64,/, "");
      const fileName = `bill-${data.roomNumber}-${data.month}.jpg`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'bills');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadDir, fileName), base64Data, 'base64');

      // 2. ส่งไปที่ LINE
      const imageUrl = `${SERVER_URL}/uploads/bills/${fileName}`;
      
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
      console.error("❌ LINE Image Error:", error.body || error.message);
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