import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  // === APP CONFIGS GERAIS ===
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(4000),
  FRONTEND_URL: Joi.string().uri().required(),

  // === DATABASE ===
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().allow(""),
  DB_NAME: Joi.string().required(),
  DB_SSL: Joi.boolean().truthy("true").falsy("false").default(false),
  TYPEORM_LOGGING: Joi.boolean().truthy("true").falsy("false").default(false),

  // === BREVO (SMTP) ===
  //BREVO_API_KEY: Joi.string().min(10).required(),

  // === JWT ===
  //JWT_SECRET: Joi.string().min(32).required(),
  //JWT_EXPIRES_IN: Joi.string().default('7d'),

  // === RATE LIMIT CONFIG ===
  RATE_LIMIT_GLOBAL_TTL: Joi.number().default(60),
  RATE_LIMIT_GLOBAL_LIMIT: Joi.number().default(100),

  RATE_LIMIT_USERS_TTL: Joi.number().default(60),
  RATE_LIMIT_USERS_LIMIT: Joi.number().default(200),

  RATE_LIMIT_MAILS_TTL: Joi.number().default(3600),
  RATE_LIMIT_MAILS_LIMIT: Joi.number().default(5),

  RATE_LIMIT_HEALTH_TTL: Joi.number().default(30),
  RATE_LIMIT_HEALTH_LIMIT: Joi.number().default(30),

  RATE_LIMIT_CUSTOMERS_TTL: Joi.number().default(30),
  RATE_LIMIT_CUSTOMERS_LIMIT: Joi.number().default(30),

  RATE_LIMIT_DEFAULT_TTL: Joi.number().default(60),
  RATE_LIMIT_DEFAULT_LIMIT: Joi.number().default(50),
});
