"use strict";
var express = require("express"),
    logger = require("morgan"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    session = require("express-session"),
    mongojs = require("mongojs"),
    compression = require('compression');

const MongoStore = require("connect-mongo")(session);

let app = express();

let config = {
    db: process.env.DBURL
};

// Integrate Middleware
app.use(logger("dev"));
app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: "keyboard cat",
    store: new MongoStore({ url: config.db })
}));

app.use((req, res, next) => {
    // MONGOJS - See GH for Docs
    req.db = mongojs(config.db);
    next();
});

app.get("/dynamic", (req, res) => {
	res.send("Hello, world");
});

app.use(compression());
app.use(express.static("Build/Client"));

// require("./routes/test.js")(app);

var server = app.listen(process.env.PORT || 3000, () => {
	var {address: host, port} = server.address();

	console.log(`Listening on http://${host}:${port}/`);
});


var io = require("socket.io")(server)
// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

//new stuff, in addition to chat parts above
var users = {};
var teams = {};

io.on('connection', function (socket) {
  socket.on("register", function(data){
  	//eventually add auth here
  	socket.username = data.username;
  	users[data.username] = {socket: socket};
    socket.emit("loggedin", data.username);
  });
  socket.on("checkusername", function(username){
    if(false){ //add auth check here
      socket.emit("usernamecheckresponse", "not available");
    }
  });
  socket.on("checkteamname", function(teamname){
    console.log(teamname);
    console.log(teams);
    console.log(teamname in teams);
    if(teamname in teams){
      if(teams[teamname].users.length == 5){
        socket.emit("teamcheckresponse", "full");
      }
      else{
        socket.emit("teamcheckresponse", "exists");
      }
    }
    else{
      socket.emit("teamcheckresponse", "new");
    }
  });
  socket.on("jointeam", function(teamname){
    if(!(teamname in teams)){
      teams[teamname] = {
        name: teamname,
        users: []
      };
    }
    teams[teamname].users.push(socket.username);
    console.log(teams);
    socket.teamname = teamname;
    socket.emit("joinedteam");
    teams[teamname].users.forEach(function(user){
        socket.emit("newmember", user);
        if(user != socket.username){
          console.log("users");
          console.log(users);
          users[user].socket.emit("newmember", socket.username);
        }
    });
    if(teams[teamname].users.length == 5){
      teams[teamname].users.forEach(function(user){
        users[user].socket.emit("readytoselect");
      })
    }
  });
});
socket.on("position-update-user", function(data){
  teams[users[data.user]].users.forEach(function(user){
    if(user != data.user){
      users[user].socket.emit("position-update-others", data);
    }
  });
});
