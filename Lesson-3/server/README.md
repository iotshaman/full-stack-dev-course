# Typescript Server
*This project was scaffolded using Shaman CLI*

This typescript server project contains all the code scaffolding necessary to provide a RESTful API over HTTP. The server is built using ExpressJS, and leverages InversifyJS to handle dependency injection. It comes pre-built with app configuration, an HTTP request router, a service for reading / writing JSON files, and a health-check controller. Once you have built the project, you are ready to start the server. 

## Building the Project

If you scaffolded this project as part of a ["solution"](https://www.npmjs.com/package/shaman-cli#scaffold-solution-command) then you can use Shaman CLI to build this project. Open a command line interface (CMD, bash, etc.) and navigate to your solution folder (where your shaman.json file is located), and run the following command:

```sh
shaman build node
```

If you scaffolded this project [manually](https://www.npmjs.com/package/shaman-cli#scaffold-command) then you can use the npm command to build the project. Open a command line interface (CMD, bash, etc.) and navigate to the server project folder, then run the following command:

```sh
npm run build
```

## Starting the Server

*Note: you will need to build the server project before starting the server*

If you scaffolded this project as part of a ["solution"](https://www.npmjs.com/package/shaman-cli#scaffold-solution-command) then you can use Shaman CLI to start the server. Open a command line interface (CMD, bash, etc.) and navigate to your solution folder (where your shaman.json file is located), and run the following command:

```sh
shaman run [project]
```

**Important:** replace "[project]" with the name of your server project, as specified in your solution file.

If you scaffolded this project [manually](https://www.npmjs.com/package/shaman-cli#scaffold-command) then you can use the npm command to start the server. Open a command line interface (CMD, bash, etc.) and navigate to the server project folder, then run the following command:

```sh
npm start
```

Once the server has started, your console should write a line that looks like `2022-01-08T21:03:36.433Z INFO: Express server listening on port 3000`. To test that everything is working as expected, open a browser and enter the following into the URL box: `http://localhost:3000/api/health`. The resulting web page should look like this:

```json
{"status":"healthy"}
```

## Application Configuration

This project comes with built-in application configuration. There are 3 files that are important for application configuration:

- `app/config/app.config.json`
- `app/config/app.config.sample.json`
- `src/models/app.config.ts`

The "app.config.json" file will not be deployed to your git repository (included in .gitignore file), and is where you should store your actual application configuration. The "app.config.sample.json" file should match the schema in your actual config file, but should not store any real values that are secret (passwords, configuration strings, etc) since it will get checked into your repository. The purpose of the sample configuration file is to make sharing code easy, simply have someone download your repository, copy the sample config file into an "app.config.json" file, and then provide them with real values. 

The last file in the list, `src/models/app.config.ts`, is the configuration model. As you add and remove properties in your config file, make sure to update the model so other classes will have access to the correct properties.

## Add a Controller

To add a controller (something that handles HTTP requests), add a file somewhere in the root folder `src/controllers` and call it "name-of-controller.controller.ts". This controller should have a constructor that takes an express "Application" object, and the constructor should setup any necessary internal routing. Then, you need to add the controller to the IoC container (see ["Dependency Injection"](#/dependency-injection)), and finally add it to the controllers object in the "loadControllers" method in `src/api.router.ts`.


For example, the following controller could be created to return a static list of users whenever requests to the URI `/api/users/all` are handled by the server:

```ts
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../composition/app.composition.types";

@injectable()
export class UserController {

  private router: Router;

  constructor(@inject(TYPES.ExpressApplication) app: Application) {
    this.router = Router();
    this.router
      .get('/all', this.getStaticUsers)

    app.use('/api/users', this.router);
  }

  getStaticUsers = (_req: Request, res: Response, _next: any) => {
    const users = [
      "Eduardo",
      "Jane",
      "Rajesh",
      "John",
      "Fatima"
    ];
    res.json({users: users});
  }

}
```

Before we we can use this controller, we need to configure it in the IoC container, as well as the router. First, lets create a controller type, so dependency injection will know how to identify this controller. Open the file `src/composition/app.composition.ts` and add a new property to the "CONTROLLER_TYPES" object. For example:

```ts
const CONTROLLER_TYPES = {
  HealthController: "HealthController",
  UserController: "UserController"
}
```

Next, we need to add the controller to the IoC container. Open the file `src/composition/app.composition.ts` and add the following to the end of the "configureRouter" method, before the return statement:

```ts
container.bind<UserController>(CONTROLLER_TYPES.UserController).to(UserController);
```

The last step is to add the new controller to your router. Open the file `src/api.router` and add update the "loadControllers" method to look like this:

```ts
private loadControllers = (container: interfaces.Container): void => {
  this.controllers = [
    container.get<HealthController>(CONTROLLER_TYPES.HealthController),
    container.get<UserController>(CONTROLLER_TYPES.UserController)
  ]
}
```

You are now all setup, and your new controller is ready to go. Since you are leveraging [dependency injection](#/dependency-injection) your controller can easily be updated to include new dependencies (for example, a "UserService"). 

For more information about ExpressJS routing, [click here](https://expressjs.com/en/guide/routing.html).

## Dependency Injection

Dependency inject is an application composition technique, often associated with In inversion-of-control, that aims to improve code quality by:

1. Making code more testable
2. Reducing the coupling between objects
3. Making code more reusable
4. Reducing boiler plate code (since we dont have to manually create instances of classes)

The main concept behind dependency injection is that application components should only focus on their primary intent, and making instances of dependencies is rarely the stated intent of a given class / object. For example, a `UserService` class should only focus on CRUD (Create/Read/Update/Delete) operations, and not worry about how to create an instance of a database context class. Instead, we should rely on the underlying framework to handle the *instantiation* of dependencies, and then provide these dependencies to any classes / objects that require them (hence, dependency injection). 

This server project uses [InversifyJS](https://inversify.io/) to manage dependency injection. For an example of how dependency injection is implemented in this project, look at the below sample from the built-in health check controller:

```ts
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

  // BELOW CODE HAS BEEN OMITTED

}

```

Notice that the constructor requires an `Application` class instance be provided? This is not something that will be manually called, instead we will use an *inversion of control container (IoC container)* to automatically create instances of the health controller. The IoC container will be responsible for providing the `Application` class instance.

To make a class available through depdendency injection, first make an interface, create a class that implements this interface, and add an `injectable()` decorator to the class. For example, here is a trivial interface + class with the proper decoration:

```ts
import { injectable } from 'inversify';

export interface ISampleService {
  // INTERFACE PROPERTIES HAVE BEEN OMITTED
}

@injectable()
export class SampleService implements ISampleService {
  // CODE HAS BEEN OMITTED
}
```

Then you simply need to tell the dependency injector how to add your class. Open the file `src/composition/app.composition.types.ts` and add the following to the end of the "TYPES" object:

```ts
SampleService: "SampleService"
```

Then, open the file `src/composition/app.composition.ts` and add the following to the end of the "configureServices" method, before the return statement:

```ts
IoC.bind<ISampleService>(TYPES.SampleService).to(SampleService);
```

You could also set it up using an already available instance:

```ts
let sampleService = new SampleService();
IoC.bind<ISampleService>(TYPES.SampleService).toConstantValue(sampleService);
```

If you need the provided class to be the same instance across all requests, either use "toContantValue" and provide an existing instance (above), or use the "inSingletonScope()" method:

```ts
IoC.bind<ISampleService>(TYPES.SampleService).to(SampleService).inSingletonScope();
```

There are plenty more ways to setup your dependencies, so for more information please visit the official InversifyJS documentation. 

*Note: Using dependency injection for controllers is a little different, if you are adding a new controller to dependency injection please see the section [Add a Controller](#add-a-controller).*