/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../composition/app.composition.types";
import { RouteError } from "../../models/route-error";
import { IUserService } from "../../services/user.service";

@injectable()
export class UserController {

  private router: Router;

  constructor(
    @inject(TYPES.ExpressApplication) app: Application,
    @inject(TYPES.UserService) private userService: IUserService) {
    this.router = Router();
    this.router
      .get('/all', this.getAllUsers)
      .get('/:userId', this.getUser)
      .post('/add', this.addUser)
      // TODO: add endpoint to delete user (ex: .delete('/', this.deleteUser))
      // MORE: see todo comment at bottom of file (must be done first)

    app.use('/api/users', this.router);
  }

  getAllUsers = (_req: Request, res: Response, next: any) => {
    return this.userService.getAllUsers()
      .then(users => res.json({users}))
      .catch((ex: Error) => next(new RouteError(ex.message, 500)));
  }

  getUser = (req: Request, res: Response, next: any) => {
    if (!req.params.userId) return next(new RouteError("User id not provided.", 400));
    let userId = parseInt(req.params.userId);
    if (userId === NaN) return next(new RouteError("Invalid user id.", 400));
    return this.userService.getUser(userId)
      .then(user => res.json(user))
      .catch((ex: Error) => next(new RouteError(ex.message, 500)));
  }

  addUser = (req: Request, res: Response, next: any) => {
    if (!req.body.email) return next(new RouteError("Email not provided", 400));
    if (!req.body.firstName) return next(new RouteError("First name not provided", 400));
    if (!req.body.lastName) return next(new RouteError("Last name not provided", 400));
    if (!req.body.password) return next(new RouteError("Password not provided", 400));
    const {email, firstName, lastName, password} = req.body;
    // TODO: make call to userService.addUser
    // MORE: on promise resolution (.then) return result as json (see above method getUser)
    // MORE: on promise error (.catch) call "next" method with RouteError(ex.message, 500)
    return next(new RouteError("Not implemented.", 500));
  }

  // TODO: create a new controller method "deleteUser"
  // MORE: should accept parameter "userId" (req.params.userId)
  // MORE: should return 204 HTTP Code (ex: res.status(204).send())
  // MORE: on error, should call "next" method with RouteError(ex.message, 500)
  // PS  : user service does not already have "deleteUser" method, you will need to implement

}