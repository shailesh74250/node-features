const getEnvironmentVariable = (key: string): string => {
  if (!process.env[key]) throw new Error(`Missing environment variable '${key}'`);
  return process.env[key] as string;
};

export const getApiKeys = (key: string): string[] => {
  const api_keys = process.env[key];
  if (!api_keys) throw new Error(`${key} must be defined`);
  return api_keys.split(',');
};

const is_windows = process.env['host_os'] === 'windows';

export default {
  port: process.env.PORT || 3000,
  database: {
    host: getEnvironmentVariable('host'),
    port: 5432,
    username: getEnvironmentVariable(is_windows ? 'db_username' : 'username'),
    password: getEnvironmentVariable('password'),
    database: getEnvironmentVariable('dbname'),
    schema: getEnvironmentVariable('schema'),
  },

  api_keys: getApiKeys('ALLOWED_API_KEYS'),
};
