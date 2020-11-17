import * as dotenv from 'dotenv';

/**
 * Check if .env file exist in case of DOT_ENV = true
 */
if (process.env.DOT_ENV) {
  const envFound = dotenv.config();
  if (envFound.error) {
    throw new Error("Couldn't find .env file");
  }
}

const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
  development: {
    databaseUrl   : process.env.DB_URI,
    port          : process.env.PORT || 3000,
    jwtSecret     : process.env.JWT_SECRET,
    jwtExpires    : {
      expiresIn: process.env.JWT_EXPIRES,
    },
  },
};

// TODO: Update config based on mode
export default {
  ...config.development,
  NODE_ENV,
};
