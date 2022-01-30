/* istanbul ignore file */
import * as _path from 'path';
import { JsonFileService } from './services/json-file.service';

import { AppConfig } from './models/app.config';

export const ConfigFactory = {
  GenerateConfig: () => {
    let configService = new JsonFileService();
    let path = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
    return configService.getJson<AppConfig>(path);
  }
}