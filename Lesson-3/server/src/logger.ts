/* istanbul ignore file */
import "reflect-metadata";
import { format, createLogger, transports, Logger as WinstonLogger, config, level } from 'winston';
import { injectable } from 'inversify';

export interface ILogger {
  logger: WinstonLogger;
  write: (message: string, level?: string) => void;
}

@injectable()
export class Logger implements ILogger {

  private _logger: WinstonLogger;
  public get logger(): WinstonLogger { return this._logger; }

  constructor() {
    let myFormat = format.printf(function(info) {
      return `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`;
    });
    this._logger = createLogger({
      levels: config.syslog.levels,
      transports: [
        new transports.Console()
      ],
      format: format.combine(
        format.timestamp(),
        myFormat
      )
    });
  }

  write = (message: string, level: level = 'info') => {
    this.logger.log({ 
      level: level, 
      message: message
    });
  }
}