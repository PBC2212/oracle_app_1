import winston from 'winston';
import { config } from '../config/index.js';

const loggerInstances = new Map();

// Initialize logger with specified module name
export function initializeLogger(moduleName = 'oracle') {
  // Return existing logger if already created
  if (loggerInstances.has(moduleName)) {
    return loggerInstances.get(moduleName);
  }
  
  // Create new logger
  const logger = winston.createLogger({
    level: config.logLevel || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp, ...rest }) => {
        const modulePrefix = moduleName ? `[${moduleName}] ` : '';
        const meta = Object.keys(rest).length ? JSON.stringify(rest) : '';
        return `${timestamp} ${level.toUpperCase()}: ${modulePrefix}${message} ${meta}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'oracle.log' })
    ]
  });
  
  // Store logger instance
  loggerInstances.set(moduleName, logger);
  
  return logger;
}

// Get all logger instances
export function getAllLoggers() {
  return loggerInstances;
}