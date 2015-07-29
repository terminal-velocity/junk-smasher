"use strict";

let $ = require("jquery");
let io = require("socket.io-client");
let app = require("./vismod");
let factories = require("./factories");

$("#loginregisterbutton").html("Sign In");

let socket = io();
module.exports = socket;

////////////////////////////
//// jquery  ///////////////
////////////////////////////

$("#loginregisterbutton").click(function(){
    socket.emit("register", {
        username: $("#username").val()
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

$("#gamestart").click(function () {
    console.log("requesting that the game starts...");

    socket.emit("requestgamestart");
});

/////////////////////////////////
//////// socket.io //////////////
/////////////////////////////////

socket.on("usernamecheckresponse", function(availability){
    if(availability !== "available"){
        $("#loginregisterbutton").html("Sign In");
        $("#login #password").attr("placeholder", "Password");
    }
    else {
        $("#loginregisterbutton").html("Go");
        $("#login #password").attr("placeholder", "Password (optional)");
    }
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

socket.on("joinedteam", function(){
    $("#teamselection").fadeOut(function(){
        $("#teammembers").fadeIn();
    });

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

socket.on("newmember", function(newusername){
    $("#teammembers>ul").html($("#teammembers>ul").html() + "<li>" + newusername + "</li>");
    if (newusername === app.username) { return; }

    console.log("Received new user data for " + newusername);
    app.scene.add(factories.playerFactory([0, 0, 7000000], newusername, app));
});

socket.on("position-update-others", function (data) {
    console.log("position update:");
    console.log(data);

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

socket.on("startgame", function () {
    $(".gui-container").hide(200);
});
