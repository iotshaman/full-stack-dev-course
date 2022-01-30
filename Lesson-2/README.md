# Lesson #2 - Build and Scaffold a Database using Shaman CLI and MySQL Shaman
This lesson will get you started working with some common Iot Shaman tooling, specifically the [Shaman CLI](https://www.npmjs.com/package/shaman-cli) and [MySQL Shaman](https://www.npmjs.com/package/mysql-shaman). Before we begin, lets quickly go over the two different tools.

## Shaman CLI
Shaman CLI is an open source tool that aims to improve developer experience by simplifying the development lifecycle. Using the Shaman CLI, you can quickly do the following:

1. Scaffold high-quality solutions by declaratively defining the different components (servers, libraries, database libraries, websites, etc.).
2. Install all dependencies across all projects in a solution, even across language, with one command. Dependency hierarchy is leveraged to ensure the projects are installed in the correct order.
3. Build / Compile all projects in a solution, even across languages, with one command. Dependency hierarchy is leveraged to ensure the projects are built in the correct order.
4. Debug projects with one command. Dependency hierarchy is leveraged to ensure all runtime dependencies are built and started in the correct order.
5. Serve website projects with one command. Dependency hierarchy is leveraged to ensure all runtime dependencies are built and started in the correct order.
6. Test all projects with one command.

## MySQL Shaman
MySQL Shaman is an open source project, created and sponsored by IoT Shaman, that has 3 objectives:

1. Improve the readability of data-acesss-objects by leveraging an ORM-style interface.
2. Improve the discoverability of data-access-objects by removing "magic string" SQL queries, in favor of typed model definitions.
3. Make provisioning, building, scaffolding, and managing MySQL databases easier, by providing an easy-to-use CLI tool.

In this lesson we will use the MySQL Shaman CLI tool to 

## Requirements
Before starting this lesson please make sure you have completed Lesson #1, ensure that your Raspberry Pi is running, and then log in to the RPi over SSH.

## Install Shaman CLI / MySQL Shaman CLI Tools (Globally)
In your SSH terminal, run the following command:

```sh
sudo npm install -g mysql-shaman shaman-cli
```

## Configure a New Project Using Shaman CLI
In your SSH terminal, run the following commands (excluding comments):

```sh
# navigate to "home" folder of current user
cd ~

# create a folder to store application source code
mkdir applications

# navigate to new applications folder
cd applications

# make a solution folder 
mkdir lesson-1

# navigate to solution folder
cd lesson-1

# create new shaman.json file and open in text editor
nano shaman.json
```

Once you have completed the above commands, you should be in a text editor. Past the following code into the editor, then close and save.

```json
{
  "projects": [
	{
      "name": "sample-database",
      "environment": "node",
      "type": "database",
      "path": "database"
    }
  ]
}
```

Finally, run the following command to scaffold the solution; make sure you are still in the solution folder, where the shaman.json file is located.

```sh
shaman scaffold-solution
```

## Configure MySQL Shaman Database Config
After last step, you should have a new folder "applications/lesson-1/database", and it should include some default source code for a database library (configured for MySQL Shaman). While this scaffolding does contain almost everthing you need to get started, we do need to configure it a little bit, so it can login to the MySQL instance running on the RPi. Follow the below steps to configure:

1. Navigate into "database" folder, in terminal
2. Open "mysql-shaman.json" file using nano (or vim, whatever works)
3. Update "adminPoolConfig" -> "user" property to be your admin user
4. Update "adminPoolConfig" -> "password" property to be your admin user's password
5. Add new property "remote", after "adminPoolConfig", and set value to: true
6. Save and exit the text editor

*NOTE: Your admin user / password were setup during Lesson #1; if you have lost and / or forgotten these, please repeat Lesson #1.*

Once complete, your mysql-shaman.json should look like this:

```json
{
  "poolConfig": {
    "connectionLimit": 10,
    "host": "localhost",
    "user": "",
    "password": "",
    "database": "",
    "waitForConnections": false
  },
  "adminPoolConfig": {
    "connectionLimit": 10,
    "host": "localhost",
    "user": "[your admin username]",
    "password": "[your admin password]",
    "waitForConnections": false
  },
  "remote": true,
  "cwd": "./sql",
  "scripts": {
    "tables": [
      "tables/**/*.sql"
    ],
    "primers": [
      "primers/**/*.sql"
    ]
  }
}
```

You may notice that some of the "poolConfig" values are still not provided; this is by design, since we do not yet have a database to connect to, only a MySQL instance. In the next section we will use MySQL Shaman to build and populate a sample database, then finish the above configuration.

## Build Database Using MySQL Shaman
In your SSH terminal, make sure you are in the "database" project folder, then run the following command:

```sh
mysql-shaman build sample_01_26_22 sample-admin-1
```

The above command will do x things:

1. Create a new database called 'sample_01_26_22'
2. Create a new user 'sample-admin-1', with auto-generated password
3. Grant admin access to user 'sample-admin-1' on database 'sample_01_26_22'
4. Output the auto-generated password for user 'sample-admin-1'

This is what the output should look like (certain values have been omitted):

```
Database build complete.

Admin user: sample-admin-1
Admin password: [password will be different, so i omitted]

Please save the above user credentials in a secure password manager.
```

Now that we have a database and a user, we can finish configuring our database project's mysql-shaman.json file. Follow the below steps:

1. Open your "mysql-shaman.json" file (using nano, vim, etc.)
2. update "poolConfig" -> "user" to be "sample-admin-1"
3. update "poolConfig" -> "password" to be the database admin password (from console output)
4. update "poolConfig" -> "database" to be "sample_01_26_22"
5. Save and exit the text editor

The contents of the mysql-shaman.json should now look like this (without comments):

```json
{
  "poolConfig": {
    "connectionLimit": 10,
    "host": "localhost",
    "user": "sample-admin-1",
    "password": "[password from console output]",
    "database": "sample_01_26_22",
    "waitForConnections": false
  },
  "adminPoolConfig": {
    "connectionLimit": 10,
    "host": "localhost",
    "user": "[your admin username]",
    "password": "[your admin password]",
    "waitForConnections": false
  },
  "remote": true,
  "cwd": "./sql",
  "scripts": {
    "tables": [
      "tables/**/*.sql"
    ],
    "primers": [
      "primers/**/*.sql"
    ]
  }
}
```

# Scaffold the MySQL Database Using MySQL Shaman
The default database library project that gets scaffolded by Shaman CLI comes pre-built with a couple sample SQL files:

1. A create table script to make a table called "user".
2. A "primer" script to insert default data into the user table.

When we "scaffold" a database we are talking about running SQL scripts to create database tables, procedures, views, etc., and then populate certain tables with default data. Fortunately, MySQL Shaman makes this easy by providing a CLI command that performs the following actions:

1. Locates all SQL scripts inside the database library's "sql" folder
2. Uses the mysql-shaman.json file to login to MySQL database
3. Executes all located scripts, with the following precedence: 1) tables, 2) primers, 3) views, and 4) procedures

To scaffold the default database, make sure you are in the "database" project folder in your SSH terminal, then run the following command:

```sh
mysql-shaman scaffold
```

# Conclusion
Once you have completed the above steps, you should now have a database, with a database admin user, and a table called "user" with a pre-populated user record.

You should now be able to access this database, using your db admin creds, over the network using MySQL Workbench. Try connecting to the database using Workbench and then try running a "SELECT" statement against the "user" table.

For more information regarding MySQL Shaman, checkout the github repo:
https://github.com/iotshaman/mysql-shaman

For more information regarding Shaman CLI, checkout the github repo:
https://www.npmjs.com/package/shaman-cli