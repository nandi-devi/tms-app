import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import lorryReceiptRoutes from './routes/lorryReceiptRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import dataRoutes from './routes/dataRoutes';
import truckHiringNoteRoutes from './routes/truckHiringNoteRoutes';
import transporterRoutes from './routes/transporterRoutes';
import { protect } from './middleware/authMiddleware';


dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// Static serving for uploaded POD images (supports persistent disk via UPLOADS_DIR)
import path from 'path';
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('API is running...');
});

// Auth routes are public
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/customers', protect, customerRoutes);
app.use('/api/vehicles', protect, vehicleRoutes);
app.use('/api/lorryreceipts', protect, lorryReceiptRoutes);
app.use('/api/invoices', protect, invoiceRoutes);
app.use('/api/payments', protect, paymentRoutes);
app.use('/api/data', protect, dataRoutes);
app.use('/api/truckhiringnotes', protect, truckHiringNoteRoutes);
app.use('/api/transporters', protect, transporterRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
