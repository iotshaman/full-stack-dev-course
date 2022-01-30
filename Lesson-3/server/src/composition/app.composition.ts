/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import * as express from 'express';
import { Container } from "inversify";

import { TYPES, CONTROLLER_TYPES } from "./app.composition.types";
import { AppConfig } from "../models/app.config";
import { ILogger, Logger } from "../logger";
import { IApiService, ApiService } from "../api.service";
import { IJsonFileService, JsonFileService } from "../services/json-file.service";
import { ApiRouter } from "../api.router";
import { HealthController } from "../controllers/health/health.controller";
import { ISampleDatabaseContext, SampleDatabaseContext } from 'sample-database';
import { IUserService, UserService } from "../services/user.service";
import { UserController } from "../controllers/users/user.controller";

export function Configure(config: AppConfig): Promise<Container> {
  return configureServices(new Container(), config)
    .then(container => configureDatabaseContext(container, config))
    .then(container => configureRouter(container));
}

function configureServices(container: Container, config: AppConfig): Promise<Container> {
  container.bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
  container.bind<ILogger>(TYPES.Logger).to(Logger);
  container.bind<IApiService>(TYPES.ApiService).to(ApiService).inSingletonScope();
  container.bind<express.Application>(TYPES.ExpressApplication).toConstantValue(express());
  container.bind<IJsonFileService>(TYPES.JsonFileService).to(JsonFileService);
  container.bind<IUserService>(TYPES.UserService).to(UserService);
  return Promise.resolve(container);
}

function configureRouter(container: Container): Promise<Container> {
  container.bind<ApiRouter>(TYPES.ApiRouter).to(ApiRouter);
  container.bind<HealthController>(CONTROLLER_TYPES.HealthController).to(HealthController);
  container.bind<UserController>(CONTROLLER_TYPES.UserController).to(UserController);
  return Promise.resolve(container);
}

function configureDatabaseContext(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    let context = new SampleDatabaseContext();
    context.initialize(config.mysqlConfig);
    container.bind<ISampleDatabaseContext>(TYPES.SampleDatabaseContext).toConstantValue(context);
    res(container);
  });
}