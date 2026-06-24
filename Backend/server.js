import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
configDotenv();
const app = express();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASS}@clusterproduct.vvfbzyh.mongodb.net/`)
  .then(() => console.log('📁 MongoDB Connected for API Server'))
  .catch(err => console.error('❌ DB Connection Error:', err));
app.use(express.json());
app.use("/api",routes);
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running smoothly!`);
    console.log(`🔗 API Endpoint: http://localhost:${process.env.PORT}/api/products`);
});