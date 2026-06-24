import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
configDotenv();
const app = express();
const allowedOrigins = [
  "http://localhost:5173", 
  "https://task-eta-snowy-99.vercel.app" // 👈 Aapka exact Vercel site URL
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
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