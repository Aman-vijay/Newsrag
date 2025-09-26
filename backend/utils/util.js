import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
export const isProduction = process.env.NODE_ENV === 'production';


export const PORT = process.env.PORT || 5000;

export const FRONTEND_URL = isProduction ? process.env.FRONTEND_URL_PROD : process.env.FRONTEND_URL_DEV;