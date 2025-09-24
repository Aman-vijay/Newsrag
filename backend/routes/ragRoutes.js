import { initNews,queryNews } from "../controllers/ragController.js";

import express from "express";
const ragRouter = express.Router();

ragRouter.post("/init", initNews);
ragRouter.post("/query", queryNews);

export default ragRouter;
