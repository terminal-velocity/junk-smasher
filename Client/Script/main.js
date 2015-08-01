"use strict";
//const angular = require("angular");

// Visualisation module, used for the THREE stuff.
let app = require("./vismod");

// Dom manipulation and factory functions respectively.
const $ = require("jquery"),
    factories = require("./factories");

// Communication with the server
require("./socket");

// Fetch the dataset.
$.get("/data/doc-min-1.geojson", (data) => {
    // If string, parse into object
    if (typeof data === typeof "") {
        data = JSON.parse(data);
    }

    // points - global for debugging purposes.
    let points = window.points = [];
    console.log("There are " + data.features.length);
    for (let i = 0; i < data.features.length; i++) {
        let point = data.features[i].geometry.coordinates;
        point.active = data.features[i].properties.styleUrl
            .toLowerCase().indexOf("active") !== -1;
        point.jid = data.features[i].id;

        // Filter points based on approximate proximity to
        // the player's spawn location.
        if (
            (point[0] >= app.meta.location.lat - 30)
            && (point[0] <= app.meta.location.lat + 30)
            && (point[1] >= app.meta.location.lon - 30)
            && (point[1] <= app.meta.location.lon + 30)
        ) {
            points.push(point);
        }
    }

    app.junkMeshes = [];

    console.log("" + points.length + " are nearby");
    for (let i = 0; i < points.length; i++) {
        let point = points[i];

        // construct the cubes used to display the items.
        let mesh = factories.junkFactory(point[0], point[1], point[2],
            point.active);
        mesh.meta = {
            active: point.active,
            id: point.jid
        };
        app.junkMeshes.push(mesh);

        app.scene.add(mesh);
    }
});
