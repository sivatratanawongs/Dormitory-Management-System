import { Router } from 'express';
import multer from 'multer';
import { getSettings, updateSettings, getPaymentSettings, updatePaymentSettings } from '../controllers/settingController.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.get('/', getSettings);
router.put('/system', updateSettings);
router.get('/payment', getPaymentSettings);
router.put('/payment', upload.single('qrImage'), updatePaymentSettings);

export default router;