"use strict";
var express = require("express"),
    logger = require("morgan"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    session = require("express-session"),
    mongojs = require("mongojs"),
    compression = require('compression'),
    md5 = require("md5");

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

var mongo = mongojs(config.db);

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

function authuserexists(username, callback){
  var userpasswds = mongo.collection("user-authdata");
  userpasswds.find({username: username}, function(err, docs){
    if(err){
      console.log(err);
    }
    else{
      if(docs.length != 0){
        callback(true);
      }
      else{
        callback(false);
      }
    }
  });
}

function authcheckpasswd(username, password, callback){
  var userpasswds = mongo.collection("user-authdata");
  userpasswds.find({username: username, password: md5(password + username)}, function(err, docs){
    if(err){
      console.log(err);
    }
    else{
      if(docs.length != 0){
        callback(true);
      }
      else{
        callback(false);
      }
    }
  });
}

function authcreateuser(username, password){
  var userpasswds = mongo.collection("user-authdata");
  var user =  {username: username, password: md5(password + username)}
  userpasswds.insert(user);
}

function register(username, socket){
  socket.username = username;
  users[username] = {socket: socket};
  socket.emit("loggedin", username);
}

io.on('connection', function (socket) {
  socket.on("register", function(data){
    if(data.username in users){
      socket.emit("usernametaken");
    }
    else if(data.password != ""){
      authuserexists(data.username, function(userexists){
        if(userexists){
          authcheckpasswd(data.username, data.password, function(passwdcorrect){
            if(passwdcorrect){
              register(data.username, socket);
            }
            else {
              socket.emit("incorrectpasswd");
            }
          });
        }
        else
        {
          authcreateuser(data.username, data.password);
          register(data.username, socket);
        }
      });
    }
    else {
      authuserexists(data.username, function(userexists){
        if(!userexists){
          register(data.username, socket);
        }
        else {
          socket.emit("incorrectpasswd");
        }
      });
    }
  });

  socket.on("checkusername", function(username){
    if(username in users){
      socket.emit("usernamecheckresponse", "taken");
    }
    else {
      authuserexists(username, function(userexists){
        if(userexists){
          socket.emit("usernamecheckresponse", "needs password");
        }
        else {
          socket.emit("usernamecheckresponse", "available");
        }
      });
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
        games[gameid].allusers.forEach(function(username){
          console.log("told " + username + " that game is over")
          users[username].socket.emit("gameover");
          users[username].game = -1;
        });
      },
      userscores: userscores
    });
    setTimeout(games[gameid].end, 120000);

    console.log("New Game Started");
    console.log(games);
    games[gameid].allusers.forEach(function(username){
      users[username].game = gameid;
      users[username].socket.emit("startgame");
    });
  });

  socket.on("objectcollected", function(data){
    games[users[socket.username].game].allusers.forEach(function(username){
      users[username].socket.emit("otheruserobjectcollected", data);
    });
    var scorechange = 0;
    if(data.active){
      scorechange = -1;
    }
    else {
      scorechange = 5;
    }
    games[users[socket.username].game].userscores[socket.username] += scorechange;
    games[users[socket.username].game].scores[users[socket.username].teamname] += scorechange;
    socket.emit("scoreupdate user", games[users[socket.username].game].userscores[socket.username])
    games[users[socket.username].game].team1.users.forEach(function(username){
      users[username].socket.emit("scoreupdate all", games[users[socket.username].game].scores[games[users[socket.username].game].team1.name] + "-" + games[users[socket.username].game].scores[games[users[socket.username].game].team2.name]);
    });
    games[users[socket.username].game].team2.users.forEach(function(username){
      users[username].socket.emit("scoreupdate all", games[users[socket.username].game].scores[games[users[socket.username].game].team2.name] + "-" + games[users[socket.username].game].scores[games[users[socket.username].game].team1.name]);
    });
  });

  socket.on("disconnect", function(){
    if(socket.username){
      if(users[socket.username].team){
        teams[users[socket.username].team].splice(users[socker.username].team.indexOf(socket.username), 1);
      }
      if(users[socket.username].game > -1){
        games[users[socket.username].game].allusers.splice(games[users[socket.username].game].allusers.indexOf(socket.username), 1);
      }
      delete users[socket.username];
    }
  });
});
