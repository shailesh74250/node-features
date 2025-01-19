const getEnvironmentVariable = (key: string): string => {
  if (!process.env[key]) throw new Error(`Missing environment variable '${key}'`);
  return process.env[key] as string;
};

export const getApiKeys = (key: string): string[] => {
  const api_keys = process.env[key];
  if (!api_keys) throw new Error(`${key} must be defined`);
  return api_keys.split(',');
};

export default {
  service_a: {
    url: 'my-api.com',
    api_key: getEnvironmentVariable('SERVICE_A_API_KEY'),
  },

  api_keys: getApiKeys('ALLOWED_API_KEYS'),
};
