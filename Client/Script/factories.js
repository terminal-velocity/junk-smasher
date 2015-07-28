"use strict";

const THREE = require("three");

function skyboxFactory(base, extension, size) {
    let images = [
        base + "posx" + extension, base + "negx" + extension,
        base + "posy" + extension, base + "negy" + extension,
        base + "posz" + extension, base + "negz" + extension
    ];
    for (let i = 0; i < images.length; i++) {
        images[i] = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(images[i]),
            side: THREE.DoubleSide,
            depthWrite: false
        });
    }

    let material = new THREE.MeshFaceMaterial(images);
    let scene = new THREE.Scene();
    scene.skybox = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), material);
    scene.add(scene.skybox);
    return scene;
}

function earthFactory(radius) {
    return new THREE.Mesh(
        new THREE.SphereGeometry(radius, 64, 64),
        new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture("/earth/diffuse.jpg"),
            normalMap: THREE.ImageUtils.loadTexture("/earth/norm.jpg"),
            specularMap: THREE.ImageUtils.loadTexture("/earth/spec.jpg"),
            specular: new THREE.Color(0.33, 0.33, 0.33)
        })
    );
}

module.exports = {
    skyboxFactory,
    earthFactory
};
