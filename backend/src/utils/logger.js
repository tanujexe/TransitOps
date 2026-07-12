const env = require('../config/env');

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
  
  if (env.NODE_ENV === 'production') {
    return JSON.stringify({ timestamp, level, message, ...meta });
  }
  
  const colors = {
    info: '\x1b[36m', // cyan
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    debug: '\x1b[90m', // gray
    reset: '\x1b[0m',
  };

  const color = colors[level] || colors.reset;
  return `[${timestamp}] ${color}${level.toUpperCase()}${colors.reset}: ${message}${metaStr}`;
};

const logger = {
  info: (message, meta) => console.log(formatMessage('info', message, meta)),
  warn: (message, meta) => console.warn(formatMessage('warn', message, meta)),
  error: (message, meta) => console.error(formatMessage('error', message, meta)),
  debug: (message, meta) => {
    if (env.NODE_ENV !== 'production') {
      console.log(formatMessage('debug', message, meta));
    }
  },
};

module.exports = logger;
