"use strict";

const THREE = require("three");

function skyboxFactory(base, extension) {
    let images = [
        base + "posx" + extension, base + "negx" + extension,
        base + "posy" + extension, base + "negy" + extension,
        base + "posz" + extension, base + "negz" + extension
    ];
    for (let i = 0; i < images.length; i++) {
        images[i] = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(images[i]),
            side: THREE.DoubleSide
        });
    }

    let material = new THREE.MeshFaceMaterial(images);
    return new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), material);
}

module.exports = {
    skyboxFactory
};
