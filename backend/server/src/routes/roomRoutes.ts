import { Router } from 'express';
import { RoomController } from '../controllers/roomController.js';

const router = Router();

router.get('/', RoomController.getRooms);
router.get('/types', RoomController.getRoomTypes);
router.post('/', RoomController.createRoom);
router.put('/bulk', RoomController.saveRooms);

export default router;