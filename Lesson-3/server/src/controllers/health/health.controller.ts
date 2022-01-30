/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../composition/app.composition.types";

@injectable()
export class HealthController {

  private router: Router;

  constructor(@inject(TYPES.ExpressApplication) app: Application) {
    this.router = Router();
    this.router
      .get('/', this.getStatus)

    app.use('/api/health', this.router);
  }

  getStatus = (_req: Request, res: Response, _next: any) => {
    res.json({status: 'healthy'});
  }

}