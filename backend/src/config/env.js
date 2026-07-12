const zod = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = zod.object({
  NODE_ENV: zod.enum(['development', 'production', 'test']).default('development'),
  PORT: zod.preprocess((val) => parseInt(val, 10), zod.number().positive()).default(5000),
  DATABASE_URL: zod.string().url({ message: 'DATABASE_URL must be a valid PostgreSQL connection URL' }),
  JWT_SECRET: zod.string().min(8, { message: 'JWT_SECRET must be at least 8 characters long' }),
  JWT_EXPIRES_IN: zod.string().default('1d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

module.exports = parsed.data;
