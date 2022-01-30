import { DatabaseContext, Collection } from 'mysql-shaman';
import { User } from './models/user';

export interface ISampleDatabaseContext {
  models: {
    user: Collection<User>
  }
  runQuery: <T>(query: string, args: any) => Promise<T>;
}

export class SampleDatabaseContext extends DatabaseContext implements ISampleDatabaseContext {

  models = { 
    user: new Collection<User>()
  }

  runQuery = <T>(query: string, args: any): Promise<T> => {
    return this.query<T>(query, args)
  }

}