import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testRedisConnection } from "./services/redisService.js";

// Load environment variables first
dotenv.config();

import ragRouter from "./routes/ragRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
const PORT = process.env.PORT || 5000;

const app = express();

// Test Redis connection on startup
testRedisConnection().catch((err) => {
    console.error("Failed to connect to Redis on startup:", err);
    process.exit(1); // Exit if Redis connection fails
}
)
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

app.use("/api/rag", ragRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

