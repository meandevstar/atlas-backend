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
    awsAccessKeyId      : process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey  : process.env.AWS_SECRET_ACCESS_KEY,
    awsS3Bucket         : process.env.S3_BUCKET,
    awsRegion           : process.env.AWS_REGION,
    esCloudId           : process.env.ES_CLOUD_ID,
    esUsername          : process.env.ES_USERNAME,
    esPassword          : process.env.ES_PASSWORD,
  },
};

// TODO: Update config based on mode
export default {
  ...config.development,
  NODE_ENV,
};
