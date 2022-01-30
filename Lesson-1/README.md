# Lesson #1 - Provision Raspberry Pi / Node JS / MySQL
In lesson 1 we will be provisioning a Raspberry Pi (RPi) and installing some important software, including Node JS and MySQL (aka. MariaDB). This should take 1-3 days, and at the end you should be able to connect to your RPi over SSH, and be able to login to MySQL with an admin user account.

## Requirements
To accomplish this lesson, you need the following things:

1. A Raspberry Pi (preferably 3B+ or better)
2. An SD card (preferably an A10 32GB or better)
3. A personal computer with an SD card reader / writer
4. A Wifi router
5. MySQL Workbench 8.0.22 install on the personal computer

To install MySQL workbench 8.0.22 on your personal computer, [click here](https://downloads.mysql.com/archives/workbench/). Please do not download any version after 8.0.22, since they lack SSH capabilities (at least, without special conditions being met).

## Part 1: Provision the SD Card
Before you can boot your RPi, you first need to provision (or "image") the SD card. On a personal computer (with an SD card reader / writer) insert the SD card and follow the below steps:

1. Format SD card
2. Write ISO image of Raspberry Pi OS onto SD card (use Win32DiskImager.exe on Windows)
3. Once SD card has been imaged, open in file explorer (on personal computer)
4. create empty file 'ssh' in root folder
5. create empty file 'wpa_supplicant.conf' in root folder
6. Write the following content to the 'wpa_supplicant.conf' file (replacing SSID / PWD)

```
country=US
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="[wifi network name (SSID)]"
    psk="[wifi password]"
    proto=RSN
    key_mgmt=WPA-PSK
    pairwise=CCMP
    auth_alg=OPEN
}
```

## Part 2: Access Raspberry Pi Over SSH
Connect the RPi to a television, plug in a keyboard + mouse into the RPi, then power up the device. When the device loads, follow any prompts to setup default settings, then click the terminal button in the top-left of the screen. Once the terminal is open, enter the following command:

```sh
sudo ip addr show
```

You should see some output, and in the output there should be an interface 'wlan0'; in that section, there should be a sub-section called 'inet' with a value that looks like "x.x.x.x" where each "x" is a value between 0 and 255 (inclusive). This is your IP address, which you can use to access the RPi, over SSH, from another device.

If you have a windows machine, install Putty to access remote devices via SSH; if you are on a Mac on Linux, simply use the ssh command-line tool to connect. 

## Update / Upgrade System
Once you have connected to your device over SSH, run the following commands:

```sh
sudo apt-get update
sudo apt-get upgrade
sudo apt-get autoremove
```

## Setup New User
In your SSH terminal, run the following commands (replacing variables in braces ("[]")):

```sh
sudo adduser [username]
sudo usermod [username] -a -G pi,adm,dialout,cdrom,sudo,audio,video,plugdev,games,users,input,netdev,spi,i2c,gpio,tty
```

## Change Default Password
In your SSH terminal, run the following command:

```sh
sudo passwd pi
```

It will prompt you to enter a new password, then confirm that password. Please note, the terminal will not show what you are typing, so it will look like nothing is being typed; this is a feature, not a bug, to prevent "over-the-shoulder" credential hacks. 

## Install Node JS + NPM
In your SSH terminal, run the following commands:

```sh
sudo apt-get install nodejs npm node-semver -y
sudo npm install n -g
sudo n 14.18.2
sudo npm install npm@6.14.15 -g
```

Once complete, run the below command to reboot the device:

```sh
sudo reboot
```

## Install MySQL (aka. MariaDB)
In your SSH terminal, run the following command:

```sh
sudo apt-get install mariadb-server -y
```

## Configure MySQL Admin User
In your SSH terminal, run the following command:

```sh
sudo mysql -u root -p
```

When it prompts you for a password, simply hit "enter" (by default, there is no root password). You are now in the MySQL database shell. Enter the following commands, replacing parameters inside brackets (note: trailing semi-colons are required):

```sh
CREATE USER '[username]'@'%' IDENTIFIED BY '[password]';
GRANT ALL PRIVILEGES ON *.* TO '[username]'@'%';
GRANT GRANT OPTION ON *.* TO '[username]'@'%';
FLUSH PRIVILEGES;
```

Type "exit" and hit enter to exit out of the MySQL shell.

## Configure MySQL for Remote Access
In your SSH terminal, run the following command to open the MySQL server config in a text editor:

```sh
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

Locate and change 'bind-address' section to look like:

```
bind-address            = 0.0.0.0
```

Save and exit nano, then run the following command to restart the MySQL daemon:

```sh
sudo systemctl restart mariadb
```

In your SSH terminal, you can check to see if the change is effective by running the command `netstat -ant | grep 3306`; the output should look like this:

```
tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN
```

## Install and Configure MySQL Shaman CLI Tool
In your SSH terminal, run the following commands:

```sh
sudo npm install -g mysql-shaman
mkdir .mysql-shaman
cd .mysql-shaman
nano mysql-shaman.json
```

You should now have an open text editor; enter the following text, replacing the parameters in brackets with the values you provided during the [Configure MySQL Admin User](#configure-mysql-admin-user) step (above):

```json
{
  "adminPoolConfig": {
    "connectionLimit": 10,
    "host": "localhost",
    "user": "[local mysql admin user]",
    "password": "[local mysql admin password]",
    "waitForConnections": false
  },
  "remote": true
}
```

## Create Database and Database User
In your SSH terminal, navigate to the ".mysql-shaman" folder you created in the [Install and Configure MySQL Shaman CLI Tool](#install-and-configure-mysql-shaman-cli-tool) step (above) and run the following command:

```sh
sudo mysql-shaman build sample_db testuser
```

Once the command completes, it should show some output including the auto-generated password for "testuser". You now have a database created, with a default user "testuser". You can confirm this by logging into the MySQL shell and entering the following commands:

```sh
show databases;
select host, user from mysql.user;
```

## Configure Nginx
Nginx (pronounced engine-x) is a web-server that can also function as a reverse-proxy, load balancer, and is typically used in production systems to act as the "server" for your static website files (.html, .css, .js, etc.), as well as reverse-proxying to internal APIs. In future lessons we will update the Nginx server to include additional websites (called virtual hosts), configure our cachine strategy, and setup revere-proxies to access our REST APIs. 

To install Nginx, open your SSH terminal and run the following commands:

```sh
sudo apt-get install nginx -y
sudo systemctl start nginx
```

Once these commands complete, you should now have Nginx installed. To confirm that the server is up and running, run the following additional command:

```sh
sudo systemctl status nginx
```

If the output indicates that the Nginx daemon is running (should say "Active") then everything is operational. At this point, your RPi Nginx should have already:

1. Created a default website on your RPi (HTML page is located in the directory '/var/www/html')
2. Added a TCP port listener on port `80`
3. Configured the default "virtual host" to point towards the default website

*NOTE: essentially, virtual host is just the term for a website running inside of Nginx, and you can install as many virtual hosts in Nginx as your machine can handle (more powerful machines can serve more virtual hosts).

Since you have a virtual host configured, with a static HTML file, and a TCP listener on port 80, you should be able to open a browser (on your personal machine, or any other networked device) and view the default website by entering "http://[your raspberry pi IP address]/". 