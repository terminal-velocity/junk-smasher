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

app.use("/", require("./routes/api.js"));

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
        users: [],
        game: null
      };
    }
    teams[teamname].users.push(socket.username);
    console.log(teams);
    users[socket.username].teamname = teamname;
    socket.emit("joinedteam");
    teams[teamname].users.forEach(function(user){
        socket.emit("newmember", user);
        if(user !== socket.username){
          console.log("users");
          console.log(users);
          users[user].socket.emit("newmember", socket.username);
        }
    });
    if(teams[teamname].users.length == 5){
        teams[teamname].users.forEach(function(user){
            users[user].socket.emit("readytoselect");
        });
    }

    console.log("Teams: " + JSON.stringify(teams));
    for (let i in users) {
        console.log("" + i + ": " + users[i]);
    }
    //debugger;
  });

  socket.on("requestgamestart", function () {
      console.log("Recieved a request to start the game");

      let teamname = users[socket.username].teamname;
      let team = teams[teamname];

      for (let username of team.users) {
          users[username].socket.emit("startgame");
          console.log("Telling user to start: " + username);
      }
  });

  socket.on("position-update-user", function(data){
    //console.log("" + socket.username + "sent position update " + JSON.stringify(data));

    let teamname = users[socket.username].teamname;
    let team = teams[teamname];

    for (let username of team.users) {
        if (username !== socket.username) {
            let user = users[username];
            data.user = socket.username;
            user.socket.emit("position-update-others", data);
        }
    }
  });

  function fullteams(){
    var fullteams2 = [];
    console.log("fullteams");
    console.log(teams);
    Object.keys(teams).forEach(function(teamname){
      var team = teams[teamname];
      if(team.users.length == 5){
        fullteams2.push(team);
      }
    });
    return fullteams2;
  }

  socket.on("teamslist firstshow", function(){
    var teamdata = [];
    var fullteamslist = fullteams();
    console.log("Full teams:")
    console.log(fullteamslist);
    Object.keys(teams).forEach(function(teamname){
      var team = teams[teamname];
      var teamstate = "";
      if(team.users.length == 5){
        if(team.game){
          teamstate = "In Game";
        }
        else {
          teamstate = "Ready";
        }
      }
      else {
        teamstate = "Not Full";
      }
      teamdata.push({
        name: team.name,
        state: teamstate
      });
    });
    teams[users[socket.username].teamname].users.forEach(function(username){
      users[username].socket.emit("teamslist fulldata", teamdata);
    });
  });
});
