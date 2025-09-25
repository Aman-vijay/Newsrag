import {sendMessageStream, createSession} from '../controllers/chatController.js';

import express from 'express';
const chatRouter = express.Router();

chatRouter.post('/', sendMessageStream);

export default chatRouter;