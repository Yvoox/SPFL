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
    hudBitmap.clearRect(0, 0, width, height);
    hudBitmap.fillText(
      "Point" + JSON.stringify(selectedObject.point, 4, null),
      width / 2,
      height / 2
    );
  } else {
    console.log("NO SELECTED OBJECT");
    hudBitmap.clearRect(0, 0, width, height);
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

function hudInit() {
  console.log("HUD INITIALIZATION");
  hudCanvas = document.createElement("canvas");

  // Again, set dimensions to fit the screen.
  hudCanvas.width = 1024;
  hudCanvas.height = 256;

  // Get 2D context and draw something supercool.
  hudBitmap = hudCanvas.getContext("2d");
  hudBitmap.font = "Normal 40px Arial";
  hudBitmap.textAlign = "center";
  hudBitmap.fillStyle = "rgba(245,245,245,0.75)";

  // Create the camera and set the viewport to match the screen dimensions.
  cameraHUD = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    0,
    30
  );

  // Create also a custom scene for HUD.
  sceneHUD = new THREE.Scene();

  // Create texture from rendered graphics.
  hudTexture = new THREE.Texture(hudCanvas);
  hudTexture.needsUpdate = true;

  // Create HUD material.
  var material = new THREE.MeshBasicMaterial({ map: hudTexture });
  material.transparent = true;

  // Create plane to render the HUD. This plane fill the whole screen.
  var planeGeometry = new THREE.PlaneGeometry(width, height);
  var plane = new THREE.Mesh(planeGeometry, material);
  sceneHUD.add(plane);
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

  bouquets = createDataSet("123");

  bouquets.map(() => createDataSupport());

  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;

  container.appendChild(renderer.domElement);
  eventInitialization();
  stats = new Stats();
  container.appendChild(stats.dom);

  raycaster = new THREE.Raycaster();
}

function animate() {
  stats.update();
  controls.update();
  raycaster.setFromCamera(mouse, camera);

  // Render scene.

  renderer.render(scene, camera);

  // Render HUD on top of the scene.
  renderer.render(sceneHUD, cameraHUD);

  hudTexture.needsUpdate = true;

  // Request new frame.
  requestAnimationFrame(animate);
}

function render() {
  controls.update();
  raycaster.setFromCamera(mouse, camera);
  renderer.render(scene, camera);
  renderer.render(sceneHUD, cameraHUD);
}
