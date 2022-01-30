/* istanbul ignore file */
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as compression from 'compression';

import { Container, inject, injectable } from "inversify";
import { TYPES } from "./composition/app.composition.types";
import { ApiRouter } from './api.router';
import { AppConfig } from "./models/app.config";
import { ILogger } from "./logger";

export interface IApiService {
  app: express.Application;
  configure: (container: Container) => void;
  startApplication: () => Promise<void>;
}

@injectable()
export class ApiService implements IApiService {
  
  @inject(TYPES.AppConfig)
  private config: AppConfig;
  @inject(TYPES.Logger)
  private logger: ILogger;
  @inject(TYPES.ExpressApplication)
  public app: express.Application;
  @inject(TYPES.ApiRouter)
  private router: ApiRouter;
  public serverStarted: boolean = false;

  public configure = (container: Container): void => {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(compression());
    this.app.use(cors({
      credentials: true, 
      methods: 'GET,POST,PUT,DELETE',
      allowedHeaders: allowedHeaders.join(','),
    }));
    this.router.configure(container);
  }

  public startApplication = (): Promise<void> => {
    return new Promise((res) => {
      if (this.serverStarted) return res();
      this.app.listen(this.config.port, () => {
        this.logger.write(`Express server listening on port ${this.config.port}`);
        this.serverStarted = true;
        res();
      })
    });
  }

}

const allowedHeaders = [
  'Content-Type',
  'Data-Type',
  'Authorization'
]