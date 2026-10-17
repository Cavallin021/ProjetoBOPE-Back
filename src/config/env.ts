import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
};

if (!env.DATABASE_URL) {
  throw new Error('invalid DATABASE_URL');
}
