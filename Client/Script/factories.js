"use strict";

const THREE = require("three"),
    m = require("./math");

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

let matIA = new THREE.MeshBasicMaterial({
    color: 0x9933ff
});
let matA  = new THREE.MeshBasicMaterial({
    color: 0x00ff00
});
let geom = new THREE.BoxGeometry(5000, 5000, 5000);
function junkFactory(lat, lon, elev, active) {
    let mesh = new THREE.Mesh(geom, active ? matA : matIA);

    if (active) {
        console.log("Active!");
    }

    m.sphericalToEuler(lat, lon, elev + 6000000, mesh.position);
    return mesh;
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

function playerFactory(position, name, app) {
    let mat = new THREE.MeshNormalMaterial();
    let geo = new THREE.BoxGeometry(50000, 50000, 50000);
    let mesh = new THREE.Mesh(geo, mat);

    app.players[name] = mesh;
    return mesh;
}

module.exports = {
    skyboxFactory,
    earthFactory,
    junkFactory,
    playerFactory
};
