# ICU Patient Care - Optum Stratethon

This repository contains the code for our submission for Optum Stratethon.

# Installation Instructions

First you need to install Node.js. If you already have Node.js installed, skip the following commands.

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
source ~/.bashrc
nvm install node
```

Now clone this repository using `git`. Install `git` if it is not installed on your machine by `sudo apt install git`.
```
git clone https://github.com/abhigupta768/optum-stratethon.git
cd optum-stratethon
```

Now install the dependencies. Install `pip` first if you don't have it installed by `sudo apt install python-pip`
```
npm install
pip install -r requirements
```

Now start the server
```
python backend.py
```

And finally the application
```
npm start
```

