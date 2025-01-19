const LoadSecretsIntoEnvironment = (): void => {
  if (process.env.AWS_ENVIRONMENT_VARIABLES) {
    try {
      const aws_environment = JSON.parse(process.env.AWS_ENVIRONMENT_VARIABLES);
      Object.assign(process.env, aws_environment);
      console.info(`Successfully loaded env vars from AWS Secrets Manager: ${Object.keys(aws_environment)}`);
    } catch (error) {
      console.error('Failed to fetch env vars from AWS Secrets Manager:', error);
      throw error;
    }
  } else {
    console.info('Did not find AWS_ENVIRONMENT_VARIABLES. Environment will not be loaded from AWS.');
  }
};

export default LoadSecretsIntoEnvironment();
