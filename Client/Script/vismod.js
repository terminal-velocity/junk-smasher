"use strict";

const THREE = require("three"),
    factories = require("./factories"),
    m = require("./math");

require("./FlyControls");

let app = window.app = {};
app.scene = new THREE.Scene();
app.background = factories.skyboxFactory("/stars_", ".png", 1000);
app.renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("target"),
    logarithmicDepthBuffer: true
});
app.renderer.gammaInput = app.renderer.gammaOutput = true;
app.camera = new THREE.PerspectiveCamera(50, 1, 7.5, 10000000);
app.camera.lookAt(new THREE.Vector3(0, 0, 0));
m.sphericalToEuler(50, 0, 7500000, app.camera.position);
app.scene.add(app.camera);

(() => {
    let controls = app.controls = new THREE.FlyControls( app.camera );
	controls.movementSpeed = 100000;
	controls.domElement = app.renderer.domElement;
	controls.rollSpeed = Math.PI / 24;
	controls.autoForward = false;
	controls.dragToLook = false;

    let earth = factories.earthFactory(6300000);
    app.scene.add(earth);

    let sun = new THREE.DirectionalLight(0xffeeee, 0.8);
    sun.position.set(0, 0, 1);
    app.scene.add(sun);

    app.camera.spherical = {
        lat: 30, lon: 0, elev: 9500000
    };
    app.camera.lookAt(new THREE.Vector3(0, 0, 0));
    app.camera.rotation.z = 0;
    app.camera.update = function (delta) {
        this.spherical.lon += 5 * delta;
    };
})();

(window.onresize = () => {
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    app.camera.aspect = window.innerWidth / window.innerHeight;
    app.camera.updateProjectionMatrix();
})();

function render() {
    window.requestAnimationFrame(render);

    let skybox = app.background.skybox;
    skybox.position.set(0, 0, 0);
    app.camera.localToWorld(skybox.position);

    app.controls.update(1 / 60);
    update(app.scene, 1 / 60);

    app.renderer.clear(true, true, true);
    app.renderer.autoClearColor = false;
    app.renderer.render(app.background, app.camera);
    app.renderer.render(app.scene, app.camera);
}
render();

function update(object, delta) {
    if (typeof object.update === "function") {
        object.update(delta);
    }

    if (object.spherical) {
        m.sphericalToEuler(object.spherical.lat, object.spherical.lon,
            object.spherical.elev, object.position);
    }

    if (object.children) {
        for (let i = 0; i < object.children.length; i++) {
            update(object.children[i], delta);
        }
    }
}
