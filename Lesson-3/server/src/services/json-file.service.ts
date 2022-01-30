import * as fs from 'fs';
import { injectable } from 'inversify';

export interface IJsonFileService {
  getJson<T>(path: string): Promise<T>;
  writeJson<T>(path: string, data: T): Promise<void>;
}

@injectable()
export class JsonFileService implements IJsonFileService {

  getJson<T>(path: string): Promise<T> {
    return new Promise((res, err) => {
      fs.readFile(path, 'utf-8', (ex, data) => {
        if (ex) return err(new Error(ex.message));
        res(JSON.parse(data));
      })
    });
  }

  writeJson<T>(path: string, data: T): Promise<void> {
    return new Promise((res, err) => {
      var serializedData = JSON.stringify(data, null, 2);
      fs.writeFile(path, serializedData, (ex) => {
        if (ex) return err(ex);
        return res();
      })
    })
  }

}