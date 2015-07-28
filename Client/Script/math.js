"use strict";
const THREE = require("three");

function sphericalToEuler(lat, lon, elev, target) {
    if (!target) {
        target = new THREE.Vector3(0, 0, 0);
    }

    let phi = (lat) * Math.PI / 180;
    let theta = (lon) * Math.PI / 180;

    target.x = elev * Math.cos(phi) * Math.cos(theta);
    target.y = elev * Math.sin(phi);
    target.z = elev * Math.cos(phi) * Math.sin(theta);

    return target;
}

module.exports = {
    sphericalToEuler
};
