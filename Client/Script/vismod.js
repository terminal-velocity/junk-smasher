"use strict";

const THREE = require("three"),
    factories = require("./factories");
require("./FlyControls");

let app = window.app = {};
app.scene = new THREE.Scene();
app.renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("target")
});
app.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
app.scene.add(app.camera);

(() => {
    let skybox = factories.skyboxFactory("/stars_", ".png");
    app.scene.add(skybox);

    skybox.update = function () {
        this.position.set(0, 0, 0);

        app.camera.localToWorld(this.position);
    };

    let controls = app.controls = new THREE.FlyControls( app.camera );
	controls.movementSpeed = 1000;
	controls.domElement = app.renderer.domElement;
	controls.rollSpeed = Math.PI / 24;
	controls.autoForward = false;
	controls.dragToLook = false;
})();

(document.onresize = () => {
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    app.camera.aspect = window.innerWidth / window.innerHeight;
    app.camera.updateProjectionMatrix();
})();

function render() {
    window.requestAnimationFrame(render);

    app.controls.update(1 / 60);
    update(app.scene, 1 / 60);
    app.renderer.render(app.scene, app.camera);
}
render();

function update(object, delta) {
    if (typeof object.update === "function") {
        object.update(delta);
    }

    if (object.children) {
        for (let i = 0; i < object.children.length; i++) {
            update(object.children[i], delta);
        }
    }
}
