"use strict";

let $ = require("jquery");
let io = require("socket.io-client");
let app = require("./vismod");
let factories = require("./factories");
let THREE = require("three");

$("#loginregisterbutton").html("Sign In");

let socket = io();
module.exports = socket;

////////////////////////////
//// jquery  ///////////////
////////////////////////////

$("canvas#target").click(() => {
    console.log("click");

    let vec = new THREE.Vector3(0, 0, 0);
    for (let mesh of app.junkMeshes) {
        vec.set(
            app.camera.position.x - mesh.position.x,
            app.camera.position.y - mesh.position.y,
            app.camera.position.z - mesh.position.z
        );

        if (vec.lengthSq() <= (15000 * 15000)) {
            app.scene.remove(mesh);

            socket.emit("objectcollected", mesh.meta);

            console.log("removed object");
        }
    }
});

$("#loginregisterbutton").click(function(){
    socket.emit("register", {
        username: $("#username").val(),
        password: $("#password").val()
    });
});

$("#username").keyup(function(){
    socket.emit("checkusername", $("#username").val());
});

$("#teamname").keyup(function(){
    socket.emit("checkteamname", $("#teamname").val());
});

$("#teamjoin").click(function(){
    socket.emit("jointeam", $("#teamname").val());
});

window.startGame = function () {
    socket.emit("requestgamestart");
};

$("#gamestart").click(window.startGame);

/////////////////////////////////
//////// socket.io //////////////
/////////////////////////////////

socket.on("scoreupdate all", function (str) {
    $("#scoreText").html(str);
});

socket.on("usernamecheckresponse", function(availability){
    if(availability == "available"){
        $("#loginregisterbutton").show();
        $("#loginunavailable").hide();
        $("#loginregisterbutton").html("Go!");
        $("#login #password").attr("placeholder", "Password (optional)");
    }
    else if(availability == "needs password"){
      $("#loginregisterbutton").show();
      $("#loginunavailable").hide();
      $("#loginregisterbutton").html("Sign In");
      $("#login #password").attr("placeholder", "Password");
    }
    else {
        $("#loginregisterbutton").hide();
        $("#loginunavailable").show();
    }
});

socket.on("incorrectpasswd", function(){
  alert("Sorry, that password was incorrect. Please try again.");
});

socket.on("loggedin", function(usernamefromserver) {
    app.username = usernamefromserver;
    $("#login").fadeOut(function(){
        $("#teamselection").fadeIn();
    });
});

socket.on("teamcheckresponse", function(state){
    if(state === "new"){
        $("#teamjoin").html("Create Team");
        $("#teamjoin").fadeIn();
        $("#teamfull").fadeOut();
    }
    else if(state === "exists"){
        $("#teamjoin").html("Join Team");
        $("#teamjoin").fadeIn();
        $("#teamfull").fadeOut();
    }
    else if(state === "full"){
        $("#teamjoin").fadeOut(function(){
            $("#teamfull").fadeIn();
        });
    }
});

socket.on("otheruserobjectcollected", function (object) {
    console.log("Received destruction.");

    for (let mesh of app.junkMeshes) {
        if (mesh.meta.id === object.id) {
            console.log("Destriyed object " + object.id);

            app.scene.remove(mesh);
            return;
        }
    }
});

socket.on("joinedteam", function(){
    $("#teamselection").fadeOut(function(){
        $("#teammembers").fadeIn();
    });
});

socket.on("newmember", function(newusername){
    $("#teammembers>ul").append("<li>" + newusername + "</li>");
    if (newusername === app.username) { return; }

    //console.log("Received new user data for " + newusername);
    app.scene.add(factories.playerFactory([0, 0, 7000000], newusername, app));
});

socket.on("position-update-others", function (data) {
    //console.log("position update:");
    //console.log(data);

    let userMesh = app.players[data.user];
    userMesh.position.set(
        data.position[0],
        data.position[1],
        data.position[2]
    );
});

socket.on("readytoselect", function(){
    $("#teammembers #teamready").fadeIn();
});

$("#showteamslist").click(function(){
  socket.emit("teamslist firstshow");
});

socket.on("teamslist fulldata", function(teamsdata){
  teamsdata.forEach(function(teamdata){
    $("#teamslist>ul").append("<li id='teamlist-" + teamdata.name + "' data-teamname='" + teamdata.name + "'><span class='teamname'>" + teamdata.name + "</span><span class='teamstate'>" + teamdata.state + "</span></li>");
  });
  teamsdata.forEach(function(teamdata){
    $("#teamlist-" + teamdata.name).click(function(){
      socket.emit("teamslist click", $(this).data("teamname"));
    });
  });
  $("#teammembers").fadeOut(function(){
    $("#teamslist").fadeIn();
  });

  socket.on("teamslist update", function(data){
    $("#teamlist-" + data.name + ">.teamstate").html(data.state);
  });

  socket.on("teamslist newteam", function(teamdata){
    $("#teamslist>ul").append("<li id='teamlist-" + teamdata.name + "' data-teamname='" + teamdata.name + "'><span class='teamname'>" + teamdata.name + "</span><span class='teamstate'>" + teamdata.state + "</span></li>");
    $("#teamlist-" + teamdata.name).click(function(){
      socket.emit("teamslist click", $(this).data("teamname"));
    });
  });
});

socket.on("startgame", function () {
    $(".gui-container").hide(200);

    window.setInterval(() => {
        socket.emit("position-update-user", {
            position: [
                app.camera.position.x,
                app.camera.position.y,
                app.camera.position.z
            ]
        });
    }, 100);
});
