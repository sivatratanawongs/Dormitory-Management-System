import { Router } from 'express';
import { BillingController } from '../controllers/billingController.js';

const router = Router();

router.get('/last-readings', BillingController.getLastReadings);
router.post('/bulk', BillingController.createBulk);
router.get('/tenant/:tenantId', BillingController.getHistoryByTenant);
router.get('/room/:roomId', BillingController.getHistoryByRoom);
router.post('/update-meter', BillingController.updateMeterReading);

export default router;