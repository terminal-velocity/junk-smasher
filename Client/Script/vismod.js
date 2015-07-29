"use strict";

const THREE = require("three"),
    factories = require("./factories"),
    m = require("./math");

require("./FlyControls");

let app = window.app = module.exports = {};

function lerp(a, b, alpha) {
    return a + ((b - a) * alpha);
}

app.meta = {
    location: {
        lat: lerp(28, 31, Math.random()),
        lon: 0,
        elev: lerp(7499700, 7500000, Math.random())
    }
};

app.scene = new THREE.Scene();
app.background = factories.skyboxFactory("/stars_", ".png", 1000);
app.renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("target"),
    logarithmicDepthBuffer: true
});
app.renderer.gammaInput = app.renderer.gammaOutput = true;
app.camera = new THREE.PerspectiveCamera(50, 1, 7.5, 10000000);
app.camera.lookAt(new THREE.Vector3(0, 0, 0));
app.scene.add(app.camera);
app.players = {};

(() => {
    let controls = app.controls = new THREE.FlyControls( app.camera, app.renderer.domElement );
	controls.movementSpeed = 100000;
	controls.domElement = app.renderer.domElement;
	controls.rollSpeed = Math.PI / 6;
	controls.autoForward = false;
	controls.dragToLook = false;

    let earth = factories.earthFactory(6300000);
    app.scene.add(earth);

    m.sphericalToEuler(app.meta.location.lat,
        app.meta.location.lon,
        app.meta.location.elev,
        app.camera.position);

    let sun = new THREE.DirectionalLight(0xffeeee, 0.8);
    sun.position.copy(app.camera.position);
    app.scene.add(sun);

    app.camera.lookAt(new THREE.Vector3(0, 0, 0));
    app.camera.rotation.z = 0;
})();

(window.onresize = () => {
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    app.camera.aspect = window.innerWidth / window.innerHeight;
    app.camera.updateProjectionMatrix();
})();

let clock = new THREE.Clock();
function render() {
    if (!clock.running) { clock.start(); }

    window.requestAnimationFrame(render);

    let skybox = app.background.skybox;
    skybox.position.set(0, 0, 0);
    app.camera.localToWorld(skybox.position);

    let delta = clock.getDelta();
    app.controls.update(delta);
    update(app.scene, delta);

    app.renderer.clear(true, true, true);
    app.renderer.autoClearColor = false;
    app.renderer.render(app.background, app.camera);
    app.renderer.render(app.scene, app.camera);
}

function update(object, delta) {
    if (typeof object.update === "function") {
        object.update(delta);
    }

    if (object.velocity) {
        object.position.x += object.velocity.x * delta;
        object.position.y += object.velocity.y * delta;
        object.position.z += object.velocity.z * delta;
    }

    if (object.children) {
        for (let i = 0; i < object.children.length; i++) {
            update(object.children[i], delta);
        }
    }
}

render();
