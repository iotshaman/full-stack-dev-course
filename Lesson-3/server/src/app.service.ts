/* istanbul ignore file */
import { Container } from 'inversify';

import { Configure } from './composition/app.composition';
import { TYPES } from './composition/app.composition.types';
import { ConfigFactory } from './config.factory';
import { IApiService } from './api.service';

ConfigFactory.GenerateConfig()
  .then(config => Configure(config))
  .then((container: Container) => {
    let apiService = container.get<IApiService>(TYPES.ApiService);
    apiService.configure(container);
    return apiService.startApplication();
  })
  .catch(ex => {
    console.dir(ex);
    process.exit(1);
  });