import {sendMessageStream, createSession,getHistory,clearHistory, cleanupChatSession} from '../controllers/chatController.js';

import express from 'express';
const chatRouter = express.Router();

chatRouter.post('/', sendMessageStream);
chatRouter.post('/session', createSession);
chatRouter.get('/history/:sessionId', getHistory);
chatRouter.delete('/history/:sessionId', clearHistory);
chatRouter.post('/cleanup/:sessionId', cleanupChatSession);

export default chatRouter;