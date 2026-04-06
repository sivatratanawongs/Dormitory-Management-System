// --- 1. ต้องอยู่บนสุดของไฟล์เสมอ ---
import dotenv from 'dotenv';
dotenv.config(); 

// --- 2. ตามด้วย Library หลัก ---
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'node:path';

// --- 3. แล้วค่อยตามด้วย Routes ของเรา ---
import settingRoutes from './routes/settingRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import lineRoutes from './routes/lineRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- API Routes ---
app.use('/api/line', lineRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/rooms', roomRoutes); 
app.use('/api/billings', billingRoutes);
app.use('/api/tenants', tenantRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('🏠 Baan Jatuporn API Server is running...');
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`API Server is ready! URL: http://localhost:${PORT}`);
});