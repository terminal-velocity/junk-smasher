"use strict";

const THREE = require("three"),
    factories = require("./factories"),
    m = require("./math");

// Mouse & keyboard controls, as provided by the lovely people of the
// three.js community.
require("./FlyControls");

let app = window.app = module.exports = {};

// Classic linear interpolation arithmetic.
function lerp(a, b, alpha) {
    return a + ((b - a) * alpha);
}

// Set the initial position of the user within a small random range.
app.meta = {
    location: {
        lat: lerp(28, 31, Math.random()),
        lon: 0,
        elev: lerp(7499700, 7500000, Math.random())
    }
};

// This is all the basic, initial setup to get our scene graph to
// how it needs to be, and binds the WebGL renderer to the canvas
// on the page.
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
    // Activate the controls.
    let controls = app.controls = new THREE.FlyControls( app.camera, app.renderer.domElement );
	controls.movementSpeed = 100000;
	controls.domElement = app.renderer.domElement;
	controls.rollSpeed = Math.PI / 6;
	controls.autoForward = false;
	controls.dragToLook = false;

    let earth = factories.earthFactory(6300000);
    app.scene.add(earth);

    // convert the lat/lon/elev spherical coords into
    // the customary x/y/z, with the centre of the earth
    // as the origin.
    m.sphericalToEuler(app.meta.location.lat,
        app.meta.location.lon,
        app.meta.location.elev,
        app.camera.position);

    // Let there be light!
    let sun = new THREE.DirectionalLight(0xffeeee, 0.8);
    sun.position.copy(app.camera.position);
    app.scene.add(sun);

    app.camera.lookAt(new THREE.Vector3(0, 0, 0));
    app.camera.rotation.z = 0;
})();

// Adapt to window resizing by resizing the backbuffer and correcting
// the camera aspect ratio.
(window.onresize = () => {
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    app.camera.aspect = window.innerWidth / window.innerHeight;
    app.camera.updateProjectionMatrix();
})();

// It's a timekeeping utility.
let clock = new THREE.Clock();
function render() {
    if (!clock.running) { clock.start(); }

    // The browser's super-handy frame scheduling API.
    window.requestAnimationFrame(render);

    // Always move the skybox around the camera to create the illusion 
    // of it being infinitely far away - pretty accurate for stars.
    let skybox = app.background.skybox;
    skybox.position.set(0, 0, 0);
    app.camera.localToWorld(skybox.position);

    let delta = clock.getDelta();
    app.controls.update(delta);
    update(app.scene, delta);

    // We render the skybox first then clear the depth buffer,
    // so that it can never be drawn in front of anything else.
    app.renderer.clear(true, true, true);
    app.renderer.autoClearColor = false;
    app.renderer.render(app.background, app.camera);
    app.renderer.render(app.scene, app.camera);
}

function update(object, delta) {
    // Recursively run utilities to keep the scene up to date.
    
    if (typeof object.update === "function") {
        object.update(delta);
    }

    // Velocity is not used by much, unfortunately, because the control sysyem maintains its own
    // set of values.
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
