# Lesson #3 - Update API Source to Add New Functionality
This lesson builds on what we have done in Lesson #1 (provision Raspberry Pi / MySQL) and Lesson #2 (build and scaffold a database). At the end of Lesson #3, you should be more familiar with the default API server scaffolding from Shaman CLI, you should have Postman installed, and you should be able to update API controllers and services.

## Getting Started
The first thing you will need is an provisioned MySQL database, with a table called "user" (this should have been completed in Lesson #2). Once this is available, simply download this repository to your Raspberry Pi (either via git or download as zip file), navigate to the folder in an SSH terminal, and run the following commands:

```sh
git checkout -b @mason/lesson3
npm install
npm run restore
npm run build
```

The first command will create a new local git branch to store your changes, the second command will install all solution-level dependencies, and the last 2 commands are short-cuts I have setup in the solution-level package.json file that perform Shaman CLI operations. Here is what the short-cut scripts look like under the hood

```json
{
  ...
  "scripts": {
    "restore": "shaman install node",
    "build": "shaman build node",
    "start": "shaman run sample-server",
    "debug": "shaman build node && shaman run sample-server"
  },
  ...
}
```

You will notice there are a couple of commands we have not run yet: *start* and *debug*. A quick glance at the short-cut scripts will show you that the "start" script will run the sample-server project (must first be built, using build script), and the "debug" command will save you a step when testing locally by running the build command, before running the "run" command, using the Shaman CLI.

However, before we can run the application (either using "start" or "debug" scripts) we need to configure the application. In your SSH terminal, make sure you are are located in the solution-level folder, and run the following commands:

```sh
cp ./server/app/config/app.config.sample.json ./server/app/config/app.config.json
nano ./server/app/config/app.config.json
```

Then update the "mysqlConfig" config variables so they match the database you setup in Lesson #2; save and close.

You are now ready to start the server; lets use the debug command, since its good practice while testing locally. In you SSH terminal, in the solution-level folder, run the following command:

```sh
npm run debug
```

After a few seconds, you should get console output confirming you have an express server available on port 3000. Your server is now up and running!

*NOTE:* to stop the server, click Cntl+c.


## Setup Postman

Postman, if you are not familiar with it, is an amazing application that lets you execute API requests, using a simple interface. It even lets you setup "Collections" of requests, so you can organize your saved requests along API boundaries (or any other organizational strategy that works for you). 

In order to test our API, please download and install Postman ([click here](https://www.postman.com/downloads/)) on a machine **other than** your Raspberry Pi. You will also want to download the Lesson #3 collection (includes all requests for the API); you will install this in Postman, and can use it to test the API. The collection file can be found in this repository ("lesson-3-collection.json", root folder); save this file somewhere on the machine which has Postman installed. 

Once Postman is installed and the Lesson #3 collection file is saved, open Postman, click "Collections" in the left sidebar, then click "Import". Drag and drop the "lesson-3-collections.json" file into the import wizard, then click the "Import" button. Under the collections tab (left sidebar) you should now see a collection called "Internship Lesson 3". Click on this collection (don't click the right-caret), then click the "Variables" sub-tab. Modify the "raspberry-pi" variable (both "Initial Value" and "Current Value") to reflect the actual IP address of your Raspberry Pi, then click save (or type Cntl+s); make sure you **do not** remove ":3000" from the variable values.

Now, assuming your API server is still running (from "Getting Started" section, above), you should be able to open the "Health Check" request (inside "Internship Lesson 3" collection) and click "Send"; if it works, you should get a response that looks like:

```json
{
  "status": "healthy"
}
```

## Modify Source Code to Add New Functionality
Once you have completed the "Getting Started" and "Setup Postman" sections, you are ready to begin coding. For this section, we are going to be updating an existing "UserController", and an existing "UserService", to add new functionality. Specifically, we will finish implementing the "add user" api endpoint, and will implement (from scratch) the "delete user" endpoint.

*NOTE:* in future lessons we will actually perform development on a machine other than the Raspberry Pi, then deploy the code to the Raspberry Pi to test it; however, for this lesson we are going to edit files directly on the Raspberry Pi (since we haven't covered deploying code yet).

In your SSH terminal, at the solution-level folder, run the following command:

```sh
grep -rnw './server/src' -e 'TODO:'
```

The above command will look in all source files for the string "TODO:", and output all instances. Here is what the output should look like:

```sh
./server/src/controllers/users/user.controller.ts:21:      // TODO: add endpoint to delete user (ex: .delete('/', this.deleteUser))
./server/src/controllers/users/user.controller.ts:48:    // TODO: make call to userService.addUser
./server/src/controllers/users/user.controller.ts:54:  // TODO: create a new controller method "deleteUser"
./server/src/services/user.service.ts:44:  // TODO: add a method to delete user (dont forget to update IUserService interface)
```

You wil notice that there are only 2 files with TODO comments: "user.controller.ts" and "user.service.ts". Start by opening "user.service.ts" in a text editor and complete the task described in the TODO comment. Once complete, then open the "user.controller.ts" file and complete the tasks described in the 3 TODO comments. 

Once you have completed the TODO comment tasks, you should have all the code necessary to add and delete users. To make sure there are no errors in your code, run the following command (in the solution-level folder SSH terminal):

```sh
npm run build
```

Once you have fixed any code errors, you should be able to run "npm run debug" and use Postman to test your new "add user" and "delete user" endpoints. 

## Final Steps
Once you have completed all the sections above, please create a pull request against the main branch. Here is a cheat sheet for pushing changes on your local branch to a remote Github branch.

```sh
# stage all file changes
git add .

# make a local commit
git commit -m "describe the changes, should say something like: adding add user / edit user endpoints"

# push your local "@mason/lesson3" branch to Github remote branch
git push origin @mason/lesson3
```

From here you can use Github to raise a pull request. Once the pull request has been made, please let me know and I will review.