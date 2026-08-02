import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server Configuration
  PORT: z.coerce.number().default(3000),
  API_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_MAX: z.coerce.number().default(10),
  DATABASE_POOL_MIN: z.coerce.number().default(2),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Encryption Configuration
  BCRYPT_ROUNDS: z.coerce.number().default(10),

  // Multi-Tenancy
  ENABLE_MULTI_TENANCY: z.enum(['true', 'false']).default('true'),
  DEFAULT_TENANT_ID: z.string().optional(),

  // Pagination
  DEFAULT_PAGE_LIMIT: z.coerce.number().default(20),
  MAX_PAGE_LIMIT: z.coerce.number().default(100),

  // File Upload
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  UPLOAD_DIR: z.string().default('./uploads'),
  ALLOWED_EXTENSIONS: z.string().default('jpg,jpeg,png,pdf,doc,docx'),

  // Redis Configuration (Optional - for caching/sessions)
  REDIS_URL: z.string().optional(),
  REDIS_ENABLED: z.enum(['true', 'false']).default('false'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // CORS Configuration
  CORS_ORIGINS: z.string().default('http://localhost:3001,http://localhost:3000'),

  // Article Publishing
  PUBLISH_SCHEDULE_ENABLED: z.enum(['true', 'false']).default('true'),
  ARTICLE_AUTO_PUBLISH_INTERVAL_MINUTES: z.coerce.number().default(5),

  // Email Configuration (Optional - for notifications)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),

  // Analytics
  ENABLE_ANALYTICS: z.enum(['true', 'false']).default('true'),
  ANALYTICS_RETENTION_DAYS: z.coerce.number().default(90),

  // Comment Moderation
  AUTO_APPROVE_COMMENTS: z.enum(['true', 'false']).default('false'),
  MAX_COMMENT_LENGTH: z.coerce.number().default(2000),

  // Featured Articles
  MAX_FEATURED_ARTICLES: z.coerce.number().default(5),

  // Search Configuration
  ENABLE_SEARCH_INDEX: z.enum(['true', 'false']).default('true'),

  // API Rate Limiting
  RATE_LIMIT_ENABLED: z.enum(['true', 'false']).default('true'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Application Metadata
  APP_NAME: z.string().default('Aplikasi Berita Enterprise'),
  APP_VERSION: z.string().default('1.0.0'),
  APP_DOMAIN: z.string().default('enterprise_news'),
});

type Environment = z.infer<typeof envSchema>;

const validateEnv = (): Environment => {
  const env = process.env;

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
};

const config = validateEnv();

export default config;