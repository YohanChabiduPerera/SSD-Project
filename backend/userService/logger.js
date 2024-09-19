import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),  // Console logging
    new winston.transports.File({ filename: './LogFiles/error.log', level: 'error' }),  // Error logs
    new winston.transports.File({ filename: './LogFiles/combined.log' }),  // All logs
  ],
});

export default logger;
