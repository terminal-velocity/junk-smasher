# Cosmic Junk Collector

## What and Why

Cosmic Junk Collector is a browser game in which you and teammates compete against another team live over the internet to collect as many pieces of space junk around the earth as you can in 2 minutes. Use the game's GUI to form a team and select another to battle.

Space junk, also known as space debris, is any form of rubbish in orbit around the earth. Most of it is disused satellites, or spent rocket pieces. Every year, more space junk ends up there, and it's a problem, because any contact with orbiting material is devastating for rockets or space stations.

## How to install

Install Node.js (with NPM). Have a MongoDB instance available somewhere. Clone the repo and change directory into it. Then:

```
npm install
```

Add your credentials for Mongo into `.env`, and install `foreman` so you can use it:

```
echo "DBURL=mongo://user:password@your-mongo.server" > .env
npm install -g foreman
```

Then run:

```
nf run npm start
```

## Links

https://docs.google.com/presentation/d/1NXdO59YCm2fi478ZhVOWfD6-Db5Wo0w5IAcwWDRq328/edit?usp=sharing

### Public Access

* [Heroku Example](https://junk-smash.herokuapp.com/)
* [Wiki](https://github.com/terminal-velocity/junk-smasher/wiki)

### Limited Access

* [Ideas Document](https://docs.google.com/document/d/13LjmnJRFpYNJe9nGMnW0uECy7NXQDXVVhYBzdxHYRAI/edit)
* [Presentation](https://docs.google.com/presentation/d/1NXdO59YCm2fi478ZhVOWfD6-Db5Wo0w5IAcwWDRq328/edit)
* [Slack Group](https://terminal-velocity.slack.com)
