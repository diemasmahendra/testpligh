/**
 * Logger utility
 * Provides consistent logging throughout the application
 */

const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => {
    return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File output - for keeping a history
    new winston.transports.File({ 
      filename: 'testflight-monitor.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

module.exports = {
  logger
};