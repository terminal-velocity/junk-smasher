"use strict";

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
    return [1, 2, 3]; // returns lat/lon/elev of user.
}

module.exports = {
    gameStarted, gameUpdate, getPosition
};
