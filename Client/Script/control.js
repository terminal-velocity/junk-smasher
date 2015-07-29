"use strict";

let app = require("./vismod");
let THREE = require("three");

function setForwardVelocity(velocity) {
    let direction = new THREE.Vector3(0, 0, 0);
    direction.applyQuaternion(app.camera.quaternion);

    direction.multiplyScalar(velocity);
    app.camera.velocity = direction;
}

module.exports = {
    setForwardVelocity
};
