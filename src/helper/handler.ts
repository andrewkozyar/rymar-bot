import { HttpException, HttpStatus } from '@nestjs/common';
import { createLogger, transports } from 'winston';

const errorLogger = createLogger({
  level: 'error',
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', dirname: process.cwd() }),
  ],
});

const infoLogger = createLogger({
  level: 'info',
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'info.log', dirname: process.cwd() }),
  ],
});

export const errorHandler = (
  message: string | string[],
  httpStatus: HttpStatus | number,
  e?: any,
) => {
  errorLogger.error(`${message}${e ? ': ' : ''}`, e);
  throw new HttpException(
    `${message}${
      e ? ': ' + JSON.stringify(e, Object.getOwnPropertyNames(e)) : ''
    }`,
    httpStatus,
  );
};

export const infoHandler = (message: string) => {
  infoLogger.info(message, { date: new Date() });
};
