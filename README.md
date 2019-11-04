# Springfield Challenge

This repository contains the code for our submission for Springfield Challenge held in Techfest 2018 which won us the first prize.

# Installation Instructions

## Ubuntu 16.04

First you need to install Node.js. If you already have Node.js installed, skip the following commands.

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
source ~/.bashrc
nvm install node
```

Now clone this repository using `git`. Install `git` if it is not installed on your machine by `sudo apt install git`.
```
git clone https://github.com/vaishnavsm/springfield.git
cd springfield
```

Now install the dependencies. Install `pip` first if you don't have it installed by `sudo apt install python-pip`
```
npm install
pip install -r requirements
```
You can now start the application by
```
npm start
```

