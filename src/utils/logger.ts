// this logger is used to log in specific format for monitoring dashboard
export const log = (level: log_levels, label: string, details?: any): void => {
  const log_object = {
    level,
    label,
    details,
  };
  console.log(JSON.stringify(log_object));
};

export enum log_levels {
  info = 'info',
  warning = 'warning',
  error = 'error',
}

export const log_labels = {
  // Example usage:
  module_a: {
    success: 'MODULE_A_SUCCESS',
    error: 'MODULE_A_ERROR',
  },
};
