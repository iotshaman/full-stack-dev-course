/* istanbul ignore file */
import { Application, Request, Response } from 'express';
import { inject, injectable, Container } from 'inversify';

import { RouteError } from './models/route-error';
import { ILogger } from './logger';
import { CONTROLLER_TYPES, TYPES } from './composition/app.composition.types';
import { HealthController } from './controllers/health/health.controller';
import { UserController } from './controllers/users/user.controller';

@injectable()
export class ApiRouter {
  
  @inject(TYPES.ExpressApplication)
  private app: Application;
  @inject(TYPES.Logger)
  private logger: ILogger;
  private controllers: any[] = [];

  public configure = (container: Container): void => {
    this.loadMiddleware();
    this.loadControllers(container);
    this.loadErrorHandlers();
  }

  private loadMiddleware = () => {
    this.app.all('/api/*', this.logApiRequests);
  }

  private loadControllers = (container: Container): void => {
    let controllerTypes: {classId: string, classType: any}[] = [
      {classId: CONTROLLER_TYPES.HealthController, classType: HealthController},
      {classId: CONTROLLER_TYPES.UserController, classType: UserController},
    ]
    controllerTypes.forEach(controller => {
      this.controllers.push(container.get<typeof controller.classType>(controller.classId));
    });
  }

  private loadErrorHandlers = () => {
    this.app.use(this.routeErrors);
  }

  private logApiRequests = (req: Request, res: Response, next: any) => {
    this.logger.write(`${req.method.toUpperCase()} - ${req.url}`);
    next();
  }

  private routeErrors = (err: RouteError, req: Request, res: Response, next: any) => {
    let message = `${req.method.toUpperCase()} - ${req.url} :: ${err.message}`;
    this.logger.write(message, 'error');
    if (err.statusCode != 401 && err.statusCode != 403) {
      if (err.stack) this.logger.write(err.stack);
    }
    if (!err.statusCode) return next();
    if (!err.sendMessge) return res.status(err.statusCode).send('Server Error');
    return res.status(err.statusCode).send(err.message);
  }

}