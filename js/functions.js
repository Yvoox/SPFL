function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onclick(event) {
  var intersects = raycaster.intersectObjects(dataPoints, true);
  if (intersects.length > 0) {
    selectedObject = intersects[0];
    console.log("SELECTED OBJECT : " + JSON.stringify(selectedObject, 4, null));
  } else {
    console.log("NO SELECTED OBJECT");
  }
}

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function createPanel() {
  var panel = new dat.GUI({ width: 310 });
  var folder1 = panel.addFolder("Metadata");
  var folder2 = panel.addFolder("Picture");
  settings = {
    "Flowers Color": "Red",
    "Number of Flowers": "3",
    "deactivate all": true,
    "activate all": true
  };
  folder1.add(settings, "Flowers Color");
  folder1.add(settings, "Number of Flowers");
  folder2.add(settings, "deactivate all");
  folder2.add(settings, "activate all");

  folder1.open();
  folder2.open();
}
function htmlContainerInitialization() {
  container = document.createElement("div");
  document.body.appendChild(container);
  var info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "10px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  container.appendChild(info);
}

function cameraInitialization() {
  console.log("CAMERA INITIALIZATION");
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 500;
  camera.position.y = 500;
  camera.position.x = 500;

  controls = new THREE.TrackballControls(camera);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
}

function eventInitialization() {
  console.log("EVENT INITIALIZATION");
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  renderer.domElement.addEventListener("click", onclick, true);
}

function createDataSupport() {
  var object = new THREE.Mesh(
    dataGeometry,
    new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
  );
  object.position.x = Math.random() * window.innerWidth;
  object.position.y = Math.random() * window.innerHeight;
  object.position.z = Math.random() * 800 - 400;
  dataPoints.push(object);
  scene.add(object);
}

function init() {
  console.log("INITIALIZATION");
  htmlContainerInitialization();
  cameraInitialization();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  for (var i = 0; i < 200; i++) {
    createDataSupport();
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  eventInitialization();
  stats = new Stats();
  container.appendChild(stats.dom);

  raycaster = new THREE.Raycaster();
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  controls.update();
  raycaster.setFromCamera(mouse, camera);
  renderer.render(scene, camera);
}
