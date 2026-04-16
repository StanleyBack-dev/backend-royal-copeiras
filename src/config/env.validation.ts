import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  // === APP CONFIGS GERAIS ===
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(4000),
  FRONTEND_URL: Joi.string().uri().required(),
  FRONTEND_URL_WWW: Joi.string().uri().optional(),
  COOKIE_DOMAIN: Joi.string().allow("").optional(),

  // === BOOTSTRAP ADMIN MASTER ===
  BOOTSTRAP_ADMIN_MASTER_ENABLED: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(false),
  BOOTSTRAP_ADMIN_MASTER_NAME: Joi.string().when(
    "BOOTSTRAP_ADMIN_MASTER_ENABLED",
    {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    },
  ),
  BOOTSTRAP_ADMIN_MASTER_EMAIL: Joi.string()
    .email()
    .when("BOOTSTRAP_ADMIN_MASTER_ENABLED", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  BOOTSTRAP_ADMIN_MASTER_USERNAME: Joi.string()
    .min(3)
    .when("BOOTSTRAP_ADMIN_MASTER_ENABLED", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  BOOTSTRAP_ADMIN_MASTER_PASSWORD: Joi.string()
    .min(8)
    .when("BOOTSTRAP_ADMIN_MASTER_ENABLED", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

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
  JWT_ACCESS_SECRET: Joi.string()
    .min(32)
    .when("NODE_ENV", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.string()
        .min(32)
        .default("dev-access-secret-change-me-2026-royal-copeiras"),
    }),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .when("NODE_ENV", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.string()
        .min(32)
        .default("dev-refresh-secret-change-me-2026-royal-copeiras"),
    }),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("30d"),

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
