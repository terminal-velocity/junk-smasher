"use strict";

let app = require("./vismod"),
    factories = require("./factories");

// Call this when the game starts.
function gameStarted(gameData) {
    gameData = gameData || // Example gameData
        {
            teamName: "bla",
            username: "bla",
            teammates: [
                "a", "b", "c", "d"
            ],
            opponents: [
                "f", "g", "h", "i", "j"
            ]
        };

    for (let name of gameData.teammates) {
        let player = factories.playerFactory(
            [0, 0, 0],
            name,
            app
        );
        app.scene.add(player);
    }
    for (let name of gameData.opponents) {
        let player = factories.playerFactory(
            [0, 0, 0],
            name,
            app
        );
        app.scene.add(player);
    }
}

// Call this when you recieve data from the server
function gameUpdate(data) {
    data = data || //Example data
        {
            positions: {
                "a": [1, 2, 3],
                "b": [1, 2, 3] //etc
            },

            teamScore: 123,
            opponentScore: 456,

            removedJunkIds: ["36745"] //The id property of each item.
        };
}

function getPosition() {
    return [app.camera.spherical.lat,
        app.camera.spherical.lon,
        app.camera.spherical.elev]; // returns lat/lon/elev of user.
}

module.exports = {
    gameStarted, gameUpdate, getPosition
};
