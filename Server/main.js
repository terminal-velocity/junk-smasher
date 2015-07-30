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
    db: process.env.DBURL,
    numplayers: 2
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
var games = [];

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
      if(teams[teamname].users.length == config.numplayers){
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
      fullteams().forEach(function(team){
        team.users.forEach(function(username){
          users[username].socket.emit("teamslist newteam", {
            name: teamname,
            state: "Not Full"
          });
        });
      });
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
    if(teams[teamname].users.length == config.numplayers){
        teams[teamname].users.forEach(function(user){
            users[user].socket.emit("readytoselect");
        });
        fullteams().forEach(function(team){
          team.users.forEach(function(username){
            users[username].socket.emit("teamslist update", {
              team: teamname,
              state: "Ready"
            });
          });
        });
    }
    else {
      fullteams().forEach(function(team){
        team.users.forEach(function(username){
          users[username].socket.emit("teamslist update", {
            team: teamname,
            state: "Not Full"
          });
        });
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
      if(team.users.length == config.numplayers){
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
      if(team.users.length == config.numplayers){
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

  socket.on("teamslist click", function(otherteamname){
    var gameid = games.length;
    var userscores = {};
    teams[users[socket.username].teamname].users.concat(teams[otherteamname]).forEach(function(username){
      userscores[username] = 0;
    });
    games.push({
      id: gameid,
      team1: teams[users[socket.username].teamname],
      team2: teams[otherteamname],
      scores: {
        [users[socket.username].teamname]: 0,
        [otherteamname]: 0,
      },
      allusers: teams[users[socket.username].teamname].users.concat(teams[otherteamname].users),
      starttime: Date.now(),
      endtime: (Date.now() + 120000),
      end: function(){
        this.allusers.forEach(function(username){
          users[username].socket.emit("gameover");
        });
      };
      setTimeout(games[gameid].end, 120000);
    });

    console.log("New Game Started");
    console.log(games);
    games[gameid].allusers.forEach(function(username){
      users[username].game = gameid;
      users[username].socket.emit("startgame");
    });
  });

  socket.on("objectcollected", function(data){
    games[users[socket.username].gameid].allusers.forEach(function(username){
      users[username].socket.emit("otheruserobjectcollected", data);
    });
    var scorechange = 0;
    if(data.active){
      scorechange = -1;
    }
    else {
      scorechange = 5;
    }
    games[users[socket.username].gameid].userscores[socket.username] += scorechange;
    games[users[socket.username].gameid].scores[users[socket.username].teamname] += scorechange;
    socket.emit("scoreupdate user", games[users[socket.username].gameid].userscores[socket.username])
    games[users[socket.username].gameid].team1.users.forEach(function(username){
      users[username].socket.emit("scoreupdate all", games[users[socket.username].gameid].team1.score + "-" + games[users[socket.username].gameid].team2.score);
    });
    games[users[socket.username].gameid].team2.users.forEach(function(username){
      users[username].socket.emit("scoreupdate all", games[users[socket.username].gameid].team2.score + "-" + games[users[socket.username].gameid].team1.score);
    });
  });
});
