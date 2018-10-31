function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function nearestPow2(aSize) {
  return Math.pow(2, Math.round(Math.log(aSize) / Math.log(2)));
}

function onSelectedObject(selectedObject) {
  focusOnPoint(selectedObject.position);

  glow.traverse(function(object) {
    let box = new THREE.Box3().setFromObject(selectedObject);
    let sphere = box.getBoundingSphere();
    let centerPoint = sphere.center;
    object.position.x = centerPoint.x;
    object.position.y = centerPoint.y;
    object.position.z = centerPoint.z;

    object.visible = true;
  });

  drawSplines(selectedObject);
  hudBitmap.clearRect(0, 0, width, height);
  hudBitmap.fillText(
    "Point " + selectedObject.bouquetId,
    width / 2,
    height / 2
  );
  //DRAW IMAGE

  var image = new Image(1024, 1024);
  image.crossOrigin = "anonymous";
  image.onload = drawImageActualSize;
  image.src = "../img/data_img/" + selectedObject.bouquetId + ".png";

  function drawImageActualSize() {
    hudBitmap.drawImage(this, 10, 10, width / 7, height / 4);
  }
}

function focusOnPoint(position) {
  var ignore1 = new THREE.Vector3();
  var ignore2 = new THREE.Vector3();
  var front_vector = new THREE.Vector3();

  camera.matrix.extractBasis(ignore1, ignore2, front_vector);
  camera.position.copy(position);

  camera.position.addScaledVector(front_vector, 100);

  //controls.target.copy(object.position);
}

function deleteObjectByName(objName) {
  while (scene.getObjectByName(objName)) {
    var selectedObject = scene.getObjectByName(objName);
    selectedObject.geometry.dispose();
    scene.remove(selectedObject);
  }

  animate();
}

function drawSplines(selectedObject) {
  deleteObjectByName("link");
  sx = selectedObject.position.x;
  sy = selectedObject.position.y;
  sz = selectedObject.position.z;
  var start = new THREE.Vector3(sx, sy, sz);
  dataPoints.map(i => {
    ex = i.position.x;
    ey = i.position.y;
    ez = i.position.z;

    dx = Math.pow(sx - ex, 2);
    dy = Math.pow(sy - ey, 2);
    dz = Math.pow(sz - ez, 2);
    distance = Math.sqrt(dx + dy + dz);
    if (distance < 400 && distance != 0) {
      var end = new THREE.Vector3(ex, ey, ez);
      var middle = new THREE.Vector3(
        (ex + sx) / 2 + 50,
        (ey + sy) / 2 + 50,
        (ez + sz) / 2 + 50
      );

      var curveQuad = new THREE.QuadraticBezierCurve3(start, middle, end);
      var tube = new THREE.TubeGeometry(curveQuad, 40, 1, 20, false);
      var mesh = new THREE.Mesh(
        tube,
        new THREE.MeshNormalMaterial({ opacity: 0.6, transparent: true })
      );
      currentLinks.push(mesh);
      mesh.name = "link";
      scene.add(mesh);
    }
  });
}

function onclick(event) {
  var intersects = raycaster.intersectObjects(dataPoints, true);

  if (intersects.length > 0) {
    selectedObject = intersects[0];

    onSelectedObject(selectedObject.object);
  } else {
    console.log("NO SELECTED POINT");
    glow.traverse(function(object) {
      object.visible = false;
    });
    hudBitmap.clearRect(0, 0, width, height);
    deleteObjectByName("link");
  }

  var intersects_link = raycaster.intersectObjects(currentLinks, true);
  if (intersects_link.length > 0) {
    selectedLink = intersects_link[0];

    json = selectedLink.object.geometry.toJSON();
    dataPoints.map(i => {
      if (JSON.stringify(i.position) == JSON.stringify(json.path.v2)) {
        onSelectedObject(i);
      } else {
      }
    });
  } else {
    console.log("NO SELECTED LINK");
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

function createDataSupport(bouquet) {
  var object = new THREE.Mesh(
    dataGeometry,
    new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
  );
  randX = Math.random() * window.innerWidth;
  randY = Math.random() * window.innerHeight;
  randZ = Math.random() * 800 - 400;

  object.position.x = randX;
  object.position.y = randY;
  object.position.z = randZ;
  object["bouquetId"] = bouquet.id;

  dataPoints.push(object);
  scene.add(object);
}

function hudInit() {
  console.log("HUD INITIALIZATION");
  hudCanvas = document.createElement("canvas");

  // Again, set dimensions to fit the screen.
  hudCanvas.width = width;
  hudCanvas.height = height;

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
  //var light = new THREE.DirectionalLight(0xffffff, 1);
  var light = new THREE.AmbientLight(0xffffff);
  //  light.position.set(1, 1, 1);
  scene.add(light);

  bouquets = createDataSet();

  bouquets.map(x => createDataSupport(x));

  glow.position.x = 0;
  glow.position.y = 0;
  glow.position.z = 0;

  scene.add(glow);

  glow.traverse(function(object) {
    object.visible = false;
  });

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
