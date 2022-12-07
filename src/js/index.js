import * as THREE from "three";
import * as dat from "dat.gui";

// import Stats from "three/addons/libs/stats.module.js";

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container, stats;
let camera, scene, renderer, mesh;
let _ambientLight, directionalLight, secondDirectionalLight, spotlight;
let cameraRig, activeCamera, activeHelper;
let cameraPerspective, cameraOrtho;
let cameraPerspectiveHelper, cameraOrthoHelper;
const frustumSize = 600;

let near = 150;
let far = 1000;
let fov = 50;
let camZ = 0;
let camX = 0;
let camY = 0;

let ambientLight = true;
let ambLightIntensity = 0.19;

let firstLightIntensity = 0.3;
let secondLightIntensity = 0.3;
let firstLightColor = 0x2c00ff;
let secondLightColor = 0x2c00ff;

let specularColor = 0x7c9fd9;
let specularIntensity = 1;

let animateOption = true;

init();
animate();

function addDatGui() {
  const gui = new dat.GUI();

  const options = {
    ambientLight,
    near,
    far,
    fov,
    camZ,
    camX,
    camY,
    ambLightIntensity,
    firstLightIntensity,
    secondLightIntensity,
    specularColor,
    specularIntensity,
    firstLightColor,
    secondLightColor,
    animateOption,
  };

  gui.add(options, "near", 150, 500).onChange((e) => {
    near = e;
  });

  gui.add(options, "far", 1000, 20000).onChange((e) => {
    far = e;
  });

  gui.add(options, "fov", 50, 100).onChange((e) => {
    fov = e;
    // console.log(fov)
  });

  gui.add(options, "camZ", -2500, 2500).onChange((e) => {
    camZ = e;
    // console.log(fov)
  });
  gui.add(options, "camX", -2500, 2500).onChange((e) => {
    camX = e;
    // console.log(fov)
  });
  gui.add(options, "camY", -2500, 2500).onChange((e) => {
    camY = e;
    // console.log(fov)
  });

  gui.add(options, "ambLightIntensity", 0, 1).onChange((e) => {
    ambLightIntensity = e;
    // console.log(fov)
  });

  gui.add(options, "firstLightIntensity", 0, 1).onChange((e) => {
    firstLightIntensity = e;
    // console.log(fov)
  });

  gui.addColor(options, "firstLightColor").onChange((e) => {
    firstLightColor = e;
    // console.log(fov)
  });

  gui.add(options, "secondLightIntensity", 0, 1).onChange((e) => {
    secondLightIntensity = e;
    // console.log(fov)
  });

  gui.addColor(options, "secondLightColor").onChange((e) => {
    secondLightColor = e;
    // console.log(fov)
  });

  gui.add(options, "ambientLight").onChange((e) => {
    ambientLight = !ambientLight;
    console.log(options);
  });

  gui.addColor(options, "specularColor").onChange((e) => {
    specularColor = e;
  });

  gui.add(options, "specularIntensity", 0, 200).onChange((e) => {
    specularColor = e;
  });

  gui.add(options, "animateOption").onChange((e) => {
    animateOption = !animateOption;
  });
}

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper)

  _ambientLight = new THREE.AmbientLight(0xffffff, 0.19);
  scene.add(_ambientLight);

  directionalLight = new THREE.DirectionalLight(
    firstLightColor,
    firstLightIntensity
  );
  directionalLight.position.set(1000000, 1, 0.5);
  scene.add(directionalLight);

  secondDirectionalLight = new THREE.DirectionalLight(
    secondLightColor,
    secondLightIntensity
  );
  secondDirectionalLight.position.set(-1000, -1, -0.5);
  scene.add(secondDirectionalLight);

  // spotlight = new THREE.SpotLight(0xffffff, 0.05);
  // spotlight.position.set(1000000, 10, 10);
  // scene.add(spotlight);

  // adicionando opções

  camera = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 10000);
  camera.position.z = 2500;
  cameraPerspective = new THREE.PerspectiveCamera({
    aspect: 0.5 * aspect,
    near: near,
    far: far,
  });

  // cameraPerspective = new THREE.PerspectiveCamera({
  //   fov: 50,
  //   aspect: 0.5 * aspect,
  //   near: 150,
  //   far: 1000,
  // });
  cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective);
  scene.add(cameraPerspectiveHelper);

  //
  cameraOrtho = new THREE.OrthographicCamera(
    (0.5 * frustumSize * aspect) / -2,
    (0.5 * frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    150,
    1000
  );

  cameraOrthoHelper = new THREE.CameraHelper(cameraOrtho);
  scene.add(cameraOrthoHelper);

  //

  activeCamera = cameraPerspective;
  activeHelper = cameraPerspectiveHelper;

  // counteract different front orientation of cameras vs rig

  cameraOrtho.rotation.y = Math.PI;
  cameraPerspective.rotation.y = Math.PI;

  cameraRig = new THREE.Group();

  cameraRig.add(cameraPerspective);
  cameraRig.add(cameraOrtho);

  scene.add(cameraRig);

  //

  mesh = new THREE.Mesh(
    // new THREE.BoxGeometry(40, 40, 40),
    new THREE.SphereGeometry(60, 30, 30),
    new THREE.MeshPhongMaterial({
      wireframe: false,
      specular: 0x7c9fd9,
      shininess: 1,
    })
  );
  scene.add(mesh);

  // spotlight.target = mesh;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);

  renderer.autoClear = false;

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("keydown", onKeyDown);

  addDatGui();
}

//

function onKeyDown(event) {
  switch (event.keyCode) {
    case 79 /*O*/:
      activeCamera = cameraOrtho;
      activeHelper = cameraOrthoHelper;

      break;

    case 80 /*P*/:
      activeCamera = cameraPerspective;
      activeHelper = cameraPerspectiveHelper;

      break;
  }
}

//

function onWindowResize() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  camera.aspect = 0.5 * aspect;
  camera.updateProjectionMatrix();

  cameraPerspective.aspect = 0.5 * aspect;
  cameraPerspective.updateProjectionMatrix();

  cameraOrtho.left = (-0.5 * frustumSize * aspect) / 2;
  cameraOrtho.right = (0.5 * frustumSize * aspect) / 2;
  cameraOrtho.top = frustumSize / 2;
  cameraOrtho.bottom = -frustumSize / 2;
  cameraOrtho.updateProjectionMatrix();
}

//

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  const r = Date.now() * 0.0005;


  if (animateOption) {
    mesh.position.x = 500 * Math.cos(r);
    mesh.position.z = 500 * Math.sin(r);
    mesh.position.y = 500 * Math.sin(r);
  }

  if (activeCamera === cameraPerspective) {
    cameraPerspective.fov = fov;
    cameraPerspective.near = near;
    cameraPerspective.far = far;
    cameraPerspective.position.z = camZ;
    cameraPerspective.position.x = camX;
    cameraPerspective.position.y = camY;
    // cameraPerspective.target = mesh
    // cameraPerspective.far = mesh.position.length();
    cameraPerspective.updateProjectionMatrix();

    cameraPerspectiveHelper.update();
    cameraPerspectiveHelper.visible = true;

    cameraOrthoHelper.visible = false;
  } else {
    cameraOrtho.near = near;
    cameraOrtho.far = far;
    cameraOrtho.position.z = camZ;
    cameraOrtho.position.x = camX;
    cameraOrtho.position.y = camY;

    cameraOrtho.updateProjectionMatrix();

    cameraOrthoHelper.update();
    cameraOrthoHelper.visible = true;

    cameraPerspectiveHelper.visible = false;
  }
  if (ambientLight != true) {
    _ambientLight.intensity = 0;
  } else {
    _ambientLight.intensity = ambLightIntensity;
  }
  // console.log(mesh.material)

  directionalLight.intensity = firstLightIntensity;
  directionalLight.color = new THREE.Color(firstLightColor);

  secondDirectionalLight.intensity = secondLightIntensity;
  secondDirectionalLight.color = new THREE.Color(secondLightColor);

  mesh.material.specular = new THREE.Color(specularColor);
  mesh.material.shininess = specularIntensity;

  cameraRig.lookAt(mesh.position);

  renderer.clear();

  activeHelper.visible = false;

  renderer.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  renderer.render(scene, activeCamera);

  activeHelper.visible = true;

  renderer.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  renderer.render(scene, camera);
}
