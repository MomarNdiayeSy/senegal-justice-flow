import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  
  // Email
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@ejustice.sn',
  emailFromName: process.env.EMAIL_FROM_NAME || 'e-Justice Sénégal',
  
  // SMS/WhatsApp
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
  
  // AI
  aiProvider: process.env.AI_PROVIDER || 'lovable',
  lovableAiKey: process.env.LOVABLE_AI_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(','),
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || './logs/app.log',
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
  
  // Admin
  adminEmail: process.env.ADMIN_EMAIL || 'admin@ejustice.sn',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
