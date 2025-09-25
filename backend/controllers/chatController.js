import { v4 as uuidv4 } from 'uuid';
import {searchNews} from "../services/newsService.js";
import { generateAIResponse,generateAIResponseStream } from '../services/aiService.js';
import { saveMessage, getChatHistory, clearChatHistory } from '../services/redisService.js';