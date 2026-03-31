import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path'; 
import { fileURLToPath } from 'node:url';
import settingRoutes from './routes/settingRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import lineRoutes from './routes/lineRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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