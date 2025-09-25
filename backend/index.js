import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import ragRouter from "./routes/ragRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
const PORT = process.env.PORT || 5000;

const app = express();

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

