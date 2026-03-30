import { Router } from 'express';
import * as TenantController from '../controllers/tenantController.js';

const router = Router();

router.get('/', TenantController.getAllActiveTenants); 
router.get('/:id', TenantController.getTenantDetail);
router.post('/contract', TenantController.createContract);
router.patch('/:id', TenantController.updateTenant);
router.post('/:id/upload', TenantController.upload.single('file'), TenantController.uploadTenantFile);
router.delete('/:id/file', TenantController.deleteTenantFile);
router.post('/:id/move-out', TenantController.moveOutTenant);

export default router;