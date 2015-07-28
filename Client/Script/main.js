"use strict";
//const angular = require("angular");

let app = require("./vismod");

const $ = require("jquery"),
    factories = require("./factories");

$.get("/data/doc-min-1.geojson", (data) => {
    if (typeof data === typeof "") {
        data = JSON.parse(data);
    }

    let points = window.points = [];
    console.log("There are " + data.features.length);
    for (let i = 0; i < data.features.length; i++) {
        let point = data.features[i].geometry.coordinates;
        point.active = data.features[i].properties.styleUrl === "#ActiveLEO";

        if (
            (point[0] >= app.meta.location.lat - 30)
            && (point[0] <= app.meta.location.lat + 30)
            && (point[1] >= app.meta.location.lon - 30)
            && (point[1] <= app.meta.location.lon + 30)
        ) {
            points.push(point);
        }
    }

    console.log("" + points.length + " are nearby");
    for (let i = 0; i < points.length; i++) {
        let point = points[i];

        app.scene.add(factories.junkFactory(point[0], point[1], point[2],
            point.active));
    }
});
