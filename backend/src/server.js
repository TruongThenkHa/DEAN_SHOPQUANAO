import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cors from 'cors';

import taskRouters from './routes/tasksRouters.js';
import AuthRouters from './routes/AuthRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js';
import { protect, admin } from './middleware/authMiddleware.js';
import clientProductRoutes from './routes/client/productRoutes.js';
import clientCategoryRoutes from './routes/client/categoryRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

connectDB();

app.use("/api/users", AuthRouters);   
app.use("/api/tasks", taskRouters);
// Phục vụ file ảnh tĩnh
app.use('/uploads', express.static('uploads'));
app.use("/api/uploads", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/orders', protect, admin, orderRoutes);
app.use('/api/client/products', clientProductRoutes);
app.use('/api/client', clientCategoryRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại cổng ${PORT}`);
});
