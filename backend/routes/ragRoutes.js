import { ingestNews,queryNews } from "../controllers/ragController.js";

import express from "express";
const ragRouter = express.Router();

ragRouter.post("/init", ingestNews);
ragRouter.post("/query", queryNews);

export default ragRouter;
