import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { asValue, AwilixContainer } from "awilix";

export default function loggerMiddleware(container: AwilixContainer) {
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [new winston.transports.File({ filename: "logs/app.log" })],
  });

  container.register({
    logger: asValue(logger),
  });

  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.url}`, { ip: req.ip });
    next();
  };
}
