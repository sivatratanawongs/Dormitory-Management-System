import * as line from '@line/bot-sdk';
import dotenv from 'dotenv';

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
      return;
    }

    try {
      const imageUrl = data.billImageData;
      await client.pushMessage({
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: `บิลค่าห้องมาแล้ว กรุณาชำระค่าห้อง 💵`
          },
          {
            type: 'image',
            originalContentUrl: imageUrl,
            previewImageUrl: imageUrl
          }
        ]
      });
    } catch (error: any) {
      console.error("❌ LINE Image Error Detail:", JSON.stringify(error.body || error.message, null, 2));
    }
  },

  sendBillingFlex: async (lineUserId: string, data: any) => {
    if (!lineUserId) return;

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
    } catch (error: any) {
      console.error("❌ LINE Flex Error:", error.body || error.message);
    }
  }
};