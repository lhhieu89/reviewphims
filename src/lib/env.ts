interface EnvConfig {
  YOUTUBE_API_KEY: string;
  YOUTUBE_REGION_CODE: string;
  SITE_URL: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    YOUTUBE_REGION_CODE: process.env.YOUTUBE_REGION_CODE || 'VN',
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
  };

  const missingVars: string[] = [];

  // Check for required environment variables
  if (!requiredEnvVars.YOUTUBE_API_KEY) {
    missingVars.push('YOUTUBE_API_KEY');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.\n' +
        'See .env.example for reference.'
    );
  }

  return requiredEnvVars as EnvConfig;
}

export const env = validateEnv();
