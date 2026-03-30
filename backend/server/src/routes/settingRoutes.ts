import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { 
  getSettings, 
  updateSettings, 
  getPaymentSettings, 
  updatePaymentSettings 
} from '../controllers/settingController.js';

const router = Router();

// --- การตั้งค่า Multer สำหรับอัปโหลด QR Code ---
const storage = multer.diskStorage({
  destination: 'uploads/qrcodes/',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// --- Routes สำหรับ System Settings (ค่าน้ำ/ไฟ) ---
router.get('/', getSettings);
router.put('/system', updateSettings);

// --- Routes สำหรับ Payment Settings (บัญชีธนาคาร) ---
router.get('/payment', getPaymentSettings);

// ใช้ upload.single('qrImage') เพื่อรับไฟล์ภาพจาก field ชื่อ 'qrImage'
router.put('/payment', upload.single('qrImage'), updatePaymentSettings);

export default router;