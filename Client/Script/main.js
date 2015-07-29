"use strict";
//const angular = require("angular");

let app = require("./vismod");

const $ = require("jquery"),
    factories = require("./factories");

require("./socket");

$.get("/data/doc-min-1.geojson", (data) => {
    if (typeof data === typeof "") {
        data = JSON.parse(data);
    }

    let points = window.points = [];
    console.log("There are " + data.features.length);
    for (let i = 0; i < data.features.length; i++) {
        let point = data.features[i].geometry.coordinates;
        point.active = data.features[i].properties.styleUrl === "#ActiveLEO";
        point.jid = data.features[i].id;

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

        let mesh = factories.junkFactory(point[0], point[1], point[2],
            point.active);
        app.junkMeshes.push(mesh);

        app.scene.add(mesh);
    }
});
