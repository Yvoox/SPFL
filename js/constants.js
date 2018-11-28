let container, stats;
let raycaster;

let dataPoints = []; //Array of all dataPoints
let currentLinks = []; //Array of links for the current point

let speciesArray = [];
let bouquetPositions = [];

let selectedObject; //contain the last selected item

let camera, scene, renderer;
let mouse = new THREE.Vector2();

var dataGeometry = new THREE.SphereGeometry(15, 20, 20);

let hudTexture, cameraHUD, hudBitmap, hudCanvas, sceneHUD;
let cpt = 0;

let width = nearestPow2(window.innerWidth);
let height = nearestPow2(window.innerHeight);

let bouquets = [];

let vertShader =
  "varying vec3 vNormal;void main(){vNormal = normalize( normalMatrix * normal );gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}";

let vertFragment =
  "varying vec3 vNormal;void main(){float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0 );gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;}";

let glowMaterial = new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader: vertShader,
  fragmentShader: vertFragment,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true
});

let glowingBall = new THREE.SphereGeometry(10, 20, 20);
let glow = new THREE.Mesh(glowingBall, glowMaterial);

let cameraDep = new THREE.Vector3(500, 500, 500);
let interToken = false;

let t = 0; //t for linear interpolation
let dt = 0.001; //dt for linear interpolation
