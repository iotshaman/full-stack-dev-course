import * as _bcrypt from 'bcryptjs';
import { inject, injectable } from 'inversify';
import { ISampleDatabaseContext, User } from 'sample-database';
import { TYPES } from '../composition/app.composition.types';

export interface IUserService {
  getAllUsers: () => Promise<User[]>;
  getUser: (userId: number) => Promise<User>;
  addUser: (email: string, firstName: string, lastName: string, password: string) => Promise<User>;
}

@injectable()
export class UserService implements IUserService {

  constructor(@inject(TYPES.SampleDatabaseContext) private context: ISampleDatabaseContext) {

  }

  getAllUsers = (): Promise<User[]> => {
    return this.context.models.user.find({
      columns: ['userId', 'email', 'firstName', 'lastName']
    });
  }

  getUser = (userId: number): Promise<User> => {
    return this.context.models.user.findOne({
      identity: 'userId',
      columns: ['userId', 'email', 'firstName', 'lastName'],
      args: [userId]
    });
  }

  addUser = (email: string, firstName: string, lastName: string, password: string): Promise<User> => {
    let passwordHash = _bcrypt.hashSync(password, _bcrypt.genSaltSync(8), null);
    let user = new User();
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.passwordHash = passwordHash;
    return this.context.models.user.insertOne(user)
      .then(id => this.getUser(id));
  }

  // TODO: add a method to delete user (dont forget to update IUserService interface)
  // MORE: should accept parameter "userId: number" and return Promise<void>
  // MORE: should call this.context.models.user.deleteOne(...)
  // MORE: for more information on using the database "context", see the mysql-shaman package's README
  // MORE: https://www.npmjs.com/package/mysql-shaman

}