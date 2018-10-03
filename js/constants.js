let container, stats;
let raycaster;

let dataPoints = []; //Array of all dataPoints
let selectedObject; //contain the last selected item

let camera, scene, renderer;
let mouse = new THREE.Vector2();

var dataGeometry = new THREE.SphereGeometry(15, 20, 20);

let hudTexture, cameraHUD, hudBitmap, hudCanvas, sceneHUD;
let cpt = 0;

let width = window.innerWidth;
let height = window.innerHeight;
