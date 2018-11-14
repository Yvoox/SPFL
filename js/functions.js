function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createCoordonates(bouquet) {
  //TODO
  var coeff = 0;
  bouquet.Flowers.map(it => {
    speciesArray.map((species, index) => {
      if (JSON.stringify(it).includes(species)) coeff += index;
    });
  });
  return coeff * bouquet.nbFlowers;
}

//TODO MODIFY TOSCREENXY
function toScreenXY(position, camera) {
  /*var pos = position.clone();
  pos.y = pos.y - 10;
  console.log("CAMERA : " + JSON.stringify(camera.fov));

  var projScreenMat = new THREE.Matrix4();
  projScreenMat.multiply(camera.projectionMatrix, camera.matrixWorldInverse);
  projScreenMat.multiplyVector3(pos);*/

  var fov = camera.fov * (Math.PI / 180);
  var objectSize = 100; //to change the zoom distance

  var pos = new THREE.Vector3(
    position.x + Math.abs(objectSize / Math.sin(fov / 2)),
    position.y + Math.abs(objectSize / Math.sin(fov / 2)),
    position.z + Math.abs(objectSize / Math.sin(fov / 2))
  );

  console.log("POS : " + JSON.stringify(pos));

  return pos;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function ease(t) {
  return t * t;
}

function nearestPow2(aSize) {
  return Math.pow(2, Math.round(Math.log(aSize) / Math.log(2)));
}

function onSelectedObject(selectedObject) {
  interToken = true;
  cameraDep = toScreenXY(selectedObject.position, camera);

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

  hudBitmap.fillStyle = "rgba(128, 128, 128, 0.4)";
  hudBitmap.fillRect(0, 0, width / 6, height);
  hudBitmap.fillStyle = "#FFFFFF";
  hudBitmap.lineWidth = "6";
  hudBitmap.strokeStyle = "red";
  hudBitmap.stroke();
  hudBitmap.font = "15px Georgia";
  hudBitmap.fillText(
    "Number of flowers : " + selectedObject.nbFlowers,
    width / 12,
    height / 3
  );
  hudBitmap.fillText("Flowers :", width / 24, height / 2.5);
  selectedObject.Flowers.map((x, index) =>
    hudBitmap.fillText(
      x.replace(/ .*/, ""),
      width / 16,
      height / 2.5 +
        (height / 1.8 - (height / 1.8 / selectedObject.nbFlowers) * index + 1)
    )
  );
  //DRAW IMAGE

  var image = new Image(1024, 1024);
  image.crossOrigin = "anonymous";
  image.onload = drawImageActualSize;
  image.src = "../img/data_img/" + selectedObject.bouquetId + ".png";

  function drawImageActualSize() {
    hudBitmap.drawImage(this, 5, 5, width / 7, height / 4);
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

    scene.remove(selectedObject);
    selectedObject.geometry.dispose();
    selectedObject.material.dispose();
    selectedObject = undefined;
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
    t = 0;

    onSelectedObject(selectedObject.object);
  } else {
    console.log("NO SELECTED POINT");
    glow.traverse(function(object) {
      object.visible = false;
    });
    hudBitmap.clearRect(0, 0, width, height);
    deleteObjectByName("link");
    var intersects_link = raycaster.intersectObjects(currentLinks, true);
    if (intersects_link.length > 0) {
      selectedLink = intersects_link[0];
      t = 0;

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
  coeff = createCoordonates(bouquet);
  var max = 1;
  var min = 0;
  /*FULL RANDOM CLASSIFICATION*/
  /*
  randX = Math.random() * window.innerWidth;
  randY = Math.random() * window.innerHeight;
  randZ = Math.random() * 800 - 400;
  */
  /*COEFF CLASSIFICATION*/

  randX = (Math.random() * (max - min) + min) * coeff;
  randY = (Math.random() * (max - min) + min) * coeff;
  randZ = (Math.random() * (max - min) + min) * coeff;

  /* LINEAR COOL REPRESENTATION */
  /*
  randX = 10 * coeff;
  randY = 10 * coeff;
  randZ = 10 * coeff;
  */

  object.position.x = randX;
  object.position.y = randY;
  object.position.z = randZ;
  object["bouquetId"] = bouquet.id;
  object["nbFlowers"] = bouquet.nbFlowers;
  object["Flowers"] = bouquet.Flowers;
  console.log(
    "NEW BOUQUET CREATED : " + JSON.stringify(object.position, 4, null)
  );

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
  console.log("CAMERA POSITION : " + JSON.stringify(camera.position));
  console.log("CAMERA POSITION : " + JSON.stringify(cameraDep));
}

function animate() {
  stats.update();
  controls.update();

  raycaster.setFromCamera(mouse, camera);

  // Render scene.

  if (
    camera.position.x != cameraDep.x &&
    camera.position.y != cameraDep.y &&
    camera.position.z != cameraDep.z &&
    interToken
  ) {
    var newX = lerp(camera.position.x, cameraDep.x, ease(t));
    var newY = lerp(camera.position.y, cameraDep.y, ease(t));
    var newZ = lerp(camera.position.z, cameraDep.z, ease(t));

    //dep = new THREE.Vector3(newX, newY, newZ);
    //focusOnPoint(dep);
    camera.position.set(newX, newY, newZ);

    t += dt;

    //if (t >= 1) focusOnPoint(cameraDep);
  } else {
    t = 0;
    interToken = false;
  }

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
