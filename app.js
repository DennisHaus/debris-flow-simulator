import * as THREE from "three";

import {
  OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
  PLYLoader
} from "three/addons/loaders/PLYLoader.js";

import {
  STLLoader
} from "three/addons/loaders/STLLoader.js";

import {
  OBJLoader
} from "three/addons/loaders/OBJLoader.js";


/* -------------------------------------------------------------------------- */
/* DOM helpers                                                                */
/* -------------------------------------------------------------------------- */

function $(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing HTML element: ${id}`);
  }

  return element;
}


const ui = {
  viewer: $("viewer"),

  particleTerrainFriction:
    $("particleTerrainFriction"),

  particleTerrainFrictionNumber:
    $("particleTerrainFrictionNumber"),

  particleParticleFriction:
    $("particleParticleFriction"),

  particleParticleFrictionNumber:
    $("particleParticleFrictionNumber"),

  particleCohesion:
    $("particleCohesion"),

  particleCohesionNumber:
    $("particleCohesionNumber"),

  startVelocity:
    $("startVelocity"),

  startVelocityNumber:
    $("startVelocityNumber"),

  simulationSpeed:
    $("simulationSpeed"),

  simulationSpeedNumber:
    $("simulationSpeedNumber"),

  startDirectionMode:
    $("startDirectionMode"),

  fixedDirectionControl:
    $("fixedDirectionControl"),

  directionAngle:
    $("directionAngle"),

  directionAngleNumber:
    $("directionAngleNumber"),

  terrainEvolutionEnabled:
    $("terrainEvolutionEnabled"),

  showChangeOverlay:
    $("showChangeOverlay"),

  changeLegend:
    $("changeLegend"),

  changeOverlayScale:
    $("changeOverlayScale"),

  changeOverlayScaleNumber:
    $("changeOverlayScaleNumber"),

  erosionRate:
    $("erosionRate"),

  erosionRateNumber:
    $("erosionRateNumber"),

  depositionRate:
    $("depositionRate"),

  depositionRateNumber:
    $("depositionRateNumber"),

  erosionStartSpeed:
    $("erosionStartSpeed"),

  erosionStartSpeedNumber:
    $("erosionStartSpeedNumber"),

  depositionSpeed:
    $("depositionSpeed"),

  depositionSpeedNumber:
    $("depositionSpeedNumber"),

  terrainResolution:
    $("terrainResolution"),

  terrainResolutionNumber:
    $("terrainResolutionNumber"),

  modelScale:
    $("modelScale"),

  modelScaleNumber:
    $("modelScaleNumber"),

  verticalExaggeration:
    $("verticalExaggeration"),

  verticalExaggerationNumber:
    $("verticalExaggerationNumber"),

  depthScale:
    $("depthScale"),

  depthScaleNumber:
    $("depthScaleNumber"),

  sourceArea:
    $("sourceArea"),

  sourceAreaNumber:
    $("sourceAreaNumber"),

  sourceVolume:
    $("sourceVolume"),

  sourceVolumeNumber:
    $("sourceVolumeNumber"),

  particleDensity:
    $("particleDensity"),

  particleDensityNumber:
    $("particleDensityNumber"),

  colorMode:
    $("colorMode"),

  particleSize:
    $("particleSize"),

  particleSizeNumber:
    $("particleSizeNumber"),

  rotationX:
    $("rotationX"),

  rotationXNumber:
    $("rotationXNumber"),

  rotationY:
    $("rotationY"),

  rotationYNumber:
    $("rotationYNumber"),

  rotationZ:
    $("rotationZ"),

  rotationZNumber:
    $("rotationZNumber"),

  playButton:
    $("playButton"),

  resetButton:
    $("resetButton"),

  addButton:
    $("addButton"),

  resetOrientationButton:
    $("resetOrientationButton"),

  terrainButton:
    $("terrainButton"),

  exampleTerrainButton:
    $("exampleTerrainButton"),

  dropZone:
    $("dropZone"),

  modelFileInput:
    $("modelFileInput"),

  chooseModelButton:
    $("chooseModelButton"),

  status:
    $("status"),

  particleCountStatus:
    $("particleCountStatus")
};


/* -------------------------------------------------------------------------- */
/* Parameters                                                                 */
/* -------------------------------------------------------------------------- */

const params = {
  particleTerrainFriction: 0.65,
  particleParticleFriction: 0.35,
  particleCohesion: 0.35,

  startVelocity: 0,
  simulationSpeed: 1,
  startDirectionMode: "downhill",
  directionAngle: 0,

  terrainEvolutionEnabled: true,
  showChangeOverlay: false,
  changeOverlayScale: 0.05,

  erosionRate: 0.6,
  depositionRate: 4,
  erosionStartSpeed: 0.45,
  depositionSpeed: 0.28,

  terrainResolution: 160,
  modelScale: 1,
  verticalExaggeration: 1,
  depthScale: 1,

  sourceArea: 3500,
  sourceVolume: 7000,
  particleDensity: 0.142857,

  colorMode: "velocity",
  particleSize: 2,

  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,

  running: false
};


/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const TERRAIN_SIZE = 600;
const GRAVITY = 9.81;

const MIN_VOLUME = 1000;
const MAX_VOLUME = 500000;
const MAX_PARTICLES = 4000;

const PHYSICS_STEP = 1 / 30;
const MAX_SUBSTEPS = 8;

const PARTICLE_CLEARANCE = 0.04;
const CONTACT_TOLERANCE = 0.08;

const INTERNAL_TERRAIN_DRAG_LENGTH = 120;
const INTERNAL_STATIC_FRICTION_MULTIPLIER = 1.15;
const INTERNAL_CONTACT_DAMPING = 0.15;

const INTERNAL_COHESION_REST_DISTANCE = 2.1;
const INTERNAL_COHESION_RANGE = 4.0;
const INTERNAL_COHESION_STRENGTH = 3.0;

const TERRAIN_UPDATE_INTERVAL = 0.25;
const MAX_TERRAIN_CHANGE_PER_UPDATE = 0.08;

const MIN_EROSION_SLOPE = 0.08;
const EROSION_SPEED_SCALE = 2.0;

const SETTLE_SPEED = 0.12;
const SETTLE_TIME = 0.65;

const EXAMPLE_TERRAIN_URL =
  "./example/kandersteg.stl";


/* -------------------------------------------------------------------------- */
/* Colours                                                                    */
/* -------------------------------------------------------------------------- */

const COLOR_STOPS = [
  "#0b0405",
  "#151434",
  "#242051",
  "#30386b",
  "#315778",
  "#32777f",
  "#3d9785",
  "#70b38a",
  "#abc98f",
  "#dddca0",
  "#f7f4c6"
];

const COLOR_MAP =
  COLOR_STOPS.map(
    (hex) => new THREE.Color(hex)
  );


/* -------------------------------------------------------------------------- */
/* Scene                                                                      */
/* -------------------------------------------------------------------------- */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0x030303);


const camera =
  new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    10000
  );

camera.position.set(
  430,
  340,
  430
);


const renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio || 1,
    2
  )
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

ui.viewer.appendChild(
  renderer.domElement
);


const controls =
  new OrbitControls(
    camera,
    renderer.domElement
  );

controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 2;
controls.maxDistance = 5000;


scene.add(
  new THREE.HemisphereLight(
    0xd8e6ff,
    0x202020,
    1.35
  )
);


const sun =
  new THREE.DirectionalLight(
    0xffffff,
    2
  );

sun.position.set(
  220,
  420,
  160
);

sun.castShadow = true;
sun.shadow.mapSize.set(
  2048,
  2048
);

scene.add(sun);


const terrainMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x777c78,
    roughness: 0.94,
    metalness: 0.02,
    side: THREE.DoubleSide
  });


const sourceGroup =
  new THREE.Group();

scene.add(sourceGroup);


/* -------------------------------------------------------------------------- */
/* Runtime state                                                              */
/* -------------------------------------------------------------------------- */

let terrainMesh = null;
let terrainState = null;
let importedRawPoints = null;

let sourceOutline = null;
let sourceVolumeWire = null;

let particleGeometry = null;
let particleMaterial = null;
let particlePoints = null;
let particles = null;

let overlayGeometry = null;
let overlayMaterial = null;
let overlayMesh = null;

let simulationTime = 0;
let simulationAccumulator = 0;

const source = {
  center: new THREE.Vector2(0, 0)
};

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();

const scratchNormal =
  new THREE.Vector3();


/* -------------------------------------------------------------------------- */
/* Utility functions                                                          */
/* -------------------------------------------------------------------------- */

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}


function setStatus(text) {
  ui.status.textContent = text;
}


function setPair(range, number, value) {
  range.value = String(value);
  number.value = String(value);
}


function formatNumber(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2
    }
  ).format(value);
}


function requestedParticleCount() {
  return Math.max(
    1,
    Math.round(
      params.sourceVolume *
      params.particleDensity
    )
  );
}


function updateParticleCountReadout() {
  const requested =
    requestedParticleCount();

  const simulated =
    Math.min(
      requested,
      MAX_PARTICLES
    );

  if (requested > simulated) {
    ui.particleCountStatus.textContent =
      `${formatNumber(requested)} requested · ` +
      `${formatNumber(simulated)} simulated`;
  } else {
    ui.particleCountStatus.textContent =
      `${formatNumber(simulated)} particles`;
  }
}


function bindRangeAndNumber(
  range,
  number,
  parameter,
  onInput = () => {},
  onCommit = () => {}
) {
  function update(value) {
    const numeric =
      Number(value);

    if (!Number.isFinite(numeric)) {
      return;
    }

    const min =
      Number(range.min);

    const max =
      Number(range.max);

    params[parameter] =
      clamp(
        numeric,
        min,
        max
      );

    setPair(
      range,
      number,
      params[parameter]
    );

    onInput(
      params[parameter]
    );
  }

  range.addEventListener(
    "input",
    () => update(range.value)
  );

  number.addEventListener(
    "input",
    () => update(number.value)
  );

  range.addEventListener(
    "change",
    () => onCommit(params[parameter])
  );

  number.addEventListener(
    "change",
    () => onCommit(params[parameter])
  );
}


function syncInterface() {
  const pairs = [
    [
      ui.particleTerrainFriction,
      ui.particleTerrainFrictionNumber,
      "particleTerrainFriction"
    ],
    [
      ui.particleParticleFriction,
      ui.particleParticleFrictionNumber,
      "particleParticleFriction"
    ],
    [
      ui.particleCohesion,
      ui.particleCohesionNumber,
      "particleCohesion"
    ],
    [
      ui.startVelocity,
      ui.startVelocityNumber,
      "startVelocity"
    ],
    [
      ui.simulationSpeed,
      ui.simulationSpeedNumber,
      "simulationSpeed"
    ],
    [
      ui.directionAngle,
      ui.directionAngleNumber,
      "directionAngle"
    ],
    [
      ui.changeOverlayScale,
      ui.changeOverlayScaleNumber,
      "changeOverlayScale"
    ],
    [
      ui.erosionRate,
      ui.erosionRateNumber,
      "erosionRate"
    ],
    [
      ui.depositionRate,
      ui.depositionRateNumber,
      "depositionRate"
    ],
    [
      ui.erosionStartSpeed,
      ui.erosionStartSpeedNumber,
      "erosionStartSpeed"
    ],
    [
      ui.depositionSpeed,
      ui.depositionSpeedNumber,
      "depositionSpeed"
    ],
    [
      ui.terrainResolution,
      ui.terrainResolutionNumber,
      "terrainResolution"
    ],
    [
      ui.modelScale,
      ui.modelScaleNumber,
      "modelScale"
    ],
    [
      ui.verticalExaggeration,
      ui.verticalExaggerationNumber,
      "verticalExaggeration"
    ],
    [
      ui.depthScale,
      ui.depthScaleNumber,
      "depthScale"
    ],
    [
      ui.sourceArea,
      ui.sourceAreaNumber,
      "sourceArea"
    ],
    [
      ui.sourceVolume,
      ui.sourceVolumeNumber,
      "sourceVolume"
    ],
    [
      ui.particleDensity,
      ui.particleDensityNumber,
      "particleDensity"
    ],
    [
      ui.particleSize,
      ui.particleSizeNumber,
      "particleSize"
    ],
    [
      ui.rotationX,
      ui.rotationXNumber,
      "rotationX"
    ],
    [
      ui.rotationY,
      ui.rotationYNumber,
      "rotationY"
    ],
    [
      ui.rotationZ,
      ui.rotationZNumber,
      "rotationZ"
    ]
  ];

  for (const [
    range,
    number,
    parameter
  ] of pairs) {
    setPair(
      range,
      number,
      params[parameter]
    );
  }

  ui.terrainEvolutionEnabled.checked =
    params.terrainEvolutionEnabled;

  ui.showChangeOverlay.checked =
    params.showChangeOverlay;

  ui.startDirectionMode.value =
    params.startDirectionMode;

  ui.colorMode.value =
    params.colorMode;

  updateDirectionVisibility();
  updateOverlayVisibility();
}


/* -------------------------------------------------------------------------- */
/* Procedural terrain                                                         */
/* -------------------------------------------------------------------------- */

function fract(value) {
  return value - Math.floor(value);
}


function hash2(x, z) {
  return fract(
    Math.sin(
      x * 127.1 +
      z * 311.7 +
      17.31
    ) *
    43758.5453
  );
}


function noise2(x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);

  const tx = fract(x);
  const tz = fract(z);

  const sx =
    tx * tx * (3 - 2 * tx);

  const sz =
    tz * tz * (3 - 2 * tz);

  const a = hash2(x0, z0);
  const b = hash2(x0 + 1, z0);
  const c = hash2(x0, z0 + 1);
  const d = hash2(x0 + 1, z0 + 1);

  const ab =
    THREE.MathUtils.lerp(
      a,
      b,
      sx
    );

  const cd =
    THREE.MathUtils.lerp(
      c,
      d,
      sx
    );

  return THREE.MathUtils.lerp(
    ab,
    cd,
    sz
  );
}


function fbm(x, z, octaves = 5) {
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  let weight = 0;

  for (
    let i = 0;
    i < octaves;
    i++
  ) {
    total +=
      noise2(
        x * frequency,
        z * frequency
      ) *
      amplitude;

    weight += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total / weight;
}


function terrainHeightFunction(
  x,
  z,
  sizeX,
  sizeZ
) {
  const nx = x / sizeX;
  const nz = z / sizeZ;

  const ridge =
    Math.exp(
      -Math.pow(
        (
          nz -
          0.05 -
          0.08 *
          Math.sin(nx * 16)
        ) / 0.25,
        2
      )
    );

  const secondary =
    Math.exp(
      -Math.pow(
        (
          nz +
          0.27 +
          0.05 *
          Math.sin(nx * 12)
        ) / 0.16,
        2
      )
    );

  const noise =
    fbm(
      nx * 8 + 10,
      nz * 8 - 4,
      5
    );

  const gullies =
    Math.pow(
      Math.abs(
        fbm(
          nx * 16,
          nz * 16,
          4
        ) - 0.5
      ) * 2,
      1.5
    );

  const valley =
    Math.exp(
      -Math.pow(
        (nz - 0.03) / 0.09,
        2
      )
    );

  return Math.max(
    0,
    22 +
    150 * ridge +
    60 * secondary +
    30 * noise +
    12 * gullies -
    35 * valley
  );
}


function buildHeightfield(
  resolution,
  sizeX,
  sizeZ
) {
  const heights =
    new Float32Array(
      resolution * resolution
    );

  for (
    let z = 0;
    z < resolution;
    z++
  ) {
    const nz =
      z / (resolution - 1);

    const worldZ =
      (nz - 0.5) * sizeZ;

    for (
      let x = 0;
      x < resolution;
      x++
    ) {
      const nx =
        x / (resolution - 1);

      const worldX =
        (nx - 0.5) * sizeX;

      heights[
        z * resolution + x
      ] =
        terrainHeightFunction(
          worldX,
          worldZ,
          sizeX,
          sizeZ
        ) *
        params.verticalExaggeration;
    }
  }

  return heights;
}


function buildTerrainGeometry(
  heights,
  resolution,
  sizeX,
  sizeZ
) {
  const positions =
    new Float32Array(
      resolution *
      resolution *
      3
    );

  for (
    let z = 0;
    z < resolution;
    z++
  ) {
    for (
      let x = 0;
      x < resolution;
      x++
    ) {
      const index =
        z * resolution + x;

      positions[index * 3] =
        (
          x / (resolution - 1) -
          0.5
        ) *
        sizeX;

      positions[index * 3 + 1] =
        heights[index];

      positions[index * 3 + 2] =
        (
          z / (resolution - 1) -
          0.5
        ) *
        sizeZ;
    }
  }

  const indices = [];

  for (
    let z = 0;
    z < resolution - 1;
    z++
  ) {
    for (
      let x = 0;
      x < resolution - 1;
      x++
    ) {
      const a =
        z * resolution + x;

      const b = a + 1;
      const c = a + resolution;
      const d = c + 1;

      indices.push(
        a, c, b,
        b, c, d
      );
    }
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}


function buildNormalField(
  heights,
  resolution,
  sizeX,
  sizeZ
) {
  const normalX =
    new Float32Array(
      heights.length
    );

  const normalY =
    new Float32Array(
      heights.length
    );

  const normalZ =
    new Float32Array(
      heights.length
    );

  const dx =
    sizeX /
    (resolution - 1);

  const dz =
    sizeZ /
    (resolution - 1);

  for (
    let z = 0;
    z < resolution;
    z++
  ) {
    for (
      let x = 0;
      x < resolution;
      x++
    ) {
      const x0 = Math.max(x - 1, 0);
      const x1 = Math.min(x + 1, resolution - 1);
      const z0 = Math.max(z - 1, 0);
      const z1 = Math.min(z + 1, resolution - 1);

      const sx =
        (
          heights[z * resolution + x1] -
          heights[z * resolution + x0]
        ) /
        Math.max(
          (x1 - x0) * dx,
          0.000001
        );

      const sz =
        (
          heights[z1 * resolution + x] -
          heights[z0 * resolution + x]
        ) /
        Math.max(
          (z1 - z0) * dz,
          0.000001
        );

      const nx = -sx;
      const ny = 1;
      const nz = -sz;

      const length =
        Math.hypot(nx, ny, nz) || 1;

      const index =
        z * resolution + x;

      normalX[index] = nx / length;
      normalY[index] = ny / length;
      normalZ[index] = nz / length;
    }
  }

  return {
    normalX,
    normalY,
    normalZ
  };
}


/* -------------------------------------------------------------------------- */
/* Terrain creation and sampling                                              */
/* -------------------------------------------------------------------------- */

function createTerrain(
  heights,
  resolution,
  sizeX,
  sizeZ,
  sourceType = "procedural"
) {
  if (terrainMesh) {
    scene.remove(terrainMesh);
    terrainMesh.geometry.dispose();
  }

  const geometry =
    buildTerrainGeometry(
      heights,
      resolution,
      sizeX,
      sizeZ
    );

  terrainMesh =
    new THREE.Mesh(
      geometry,
      terrainMaterial
    );

  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = false;

  scene.add(terrainMesh);

  const normalField =
    buildNormalField(
      heights,
      resolution,
      sizeX,
      sizeZ
    );

  terrainState = {
    heights,

    originalHeights:
      heights.slice(),

    resolution,
    sizeX,
    sizeZ,
    sourceType,

    normalX:
      normalField.normalX,

    normalY:
      normalField.normalY,

    normalZ:
      normalField.normalZ,

    pending:
      new Float32Array(
        heights.length
      ),

    touched:
      new Set(),

    evolutionTime: 0
  };

  createOverlay();
  fitCamera();
  updateSourceVisuals();
}


function createProceduralTerrain() {
  const resolution =
    Math.round(
      clamp(
        params.terrainResolution,
        64,
        384
      )
    );

  const sizeX =
    TERRAIN_SIZE *
    params.modelScale;

  const sizeZ =
    TERRAIN_SIZE *
    params.modelScale *
    params.depthScale;

  const heights =
    buildHeightfield(
      resolution,
      sizeX,
      sizeZ
    );

  createTerrain(
    heights,
    resolution,
    sizeX,
    sizeZ,
    "procedural"
  );
}


function terrainCoordinates(x, z) {
  const {
    resolution,
    sizeX,
    sizeZ
  } = terrainState;

  const gx =
    clamp(
      (x / sizeX + 0.5) *
      (resolution - 1),
      0,
      resolution - 1
    );

  const gz =
    clamp(
      (z / sizeZ + 0.5) *
      (resolution - 1),
      0,
      resolution - 1
    );

  const x0 = Math.floor(gx);
  const z0 = Math.floor(gz);

  const x1 =
    Math.min(
      x0 + 1,
      resolution - 1
    );

  const z1 =
    Math.min(
      z0 + 1,
      resolution - 1
    );

  return {
    x0,
    x1,
    z0,
    z1,
    tx: gx - x0,
    tz: gz - z0
  };
}


function terrainHeightAt(x, z) {
  if (!terrainState) {
    return 0;
  }

  const {
    heights,
    resolution
  } = terrainState;

  const c =
    terrainCoordinates(x, z);

  const h00 =
    heights[c.z0 * resolution + c.x0];

  const h10 =
    heights[c.z0 * resolution + c.x1];

  const h01 =
    heights[c.z1 * resolution + c.x0];

  const h11 =
    heights[c.z1 * resolution + c.x1];

  const h0 =
    THREE.MathUtils.lerp(
      h00,
      h10,
      c.tx
    );

  const h1 =
    THREE.MathUtils.lerp(
      h01,
      h11,
      c.tx
    );

  return THREE.MathUtils.lerp(
    h0,
    h1,
    c.tz
  );
}


function terrainNormalAt(x, z) {
  if (!terrainState) {
    return scratchNormal.set(
      0,
      1,
      0
    );
  }

  const {
    resolution,
    normalX,
    normalY,
    normalZ
  } = terrainState;

  const c =
    terrainCoordinates(x, z);

  function interpolate(array) {
    const a =
      THREE.MathUtils.lerp(
        array[c.z0 * resolution + c.x0],
        array[c.z0 * resolution + c.x1],
        c.tx
      );

    const b =
      THREE.MathUtils.lerp(
        array[c.z1 * resolution + c.x0],
        array[c.z1 * resolution + c.x1],
        c.tx
      );

    return THREE.MathUtils.lerp(
      a,
      b,
      c.tz
    );
  }

  const nx = interpolate(normalX);
  const ny = interpolate(normalY);
  const nz = interpolate(normalZ);

  const length =
    Math.hypot(nx, ny, nz) || 1;

  return scratchNormal.set(
    nx / length,
    ny / length,
    nz / length
  );
}


function refreshTerrainGeometry() {
  if (!terrainMesh || !terrainState) {
    return;
  }

  const positions =
    terrainMesh.geometry
      .getAttribute("position")
      .array;

  for (
    let i = 0;
    i < terrainState.heights.length;
    i++
  ) {
    positions[i * 3 + 1] =
      terrainState.heights[i];
  }

  terrainMesh.geometry
    .getAttribute("position")
    .needsUpdate = true;

  terrainMesh.geometry.computeVertexNormals();
  terrainMesh.geometry.computeBoundingBox();
  terrainMesh.geometry.computeBoundingSphere();

  const normals =
    buildNormalField(
      terrainState.heights,
      terrainState.resolution,
      terrainState.sizeX,
      terrainState.sizeZ
    );

  terrainState.normalX = normals.normalX;
  terrainState.normalY = normals.normalY;
  terrainState.normalZ = normals.normalZ;

  updateOverlay();
  updateSourceVisuals();
}


/* -------------------------------------------------------------------------- */
/* Terrain change overlay                                                     */
/* -------------------------------------------------------------------------- */

function createOverlay() {
  if (overlayMesh) {
    scene.remove(overlayMesh);
    overlayGeometry.dispose();
    overlayMaterial.dispose();
  }

  const {
    heights,
    resolution,
    sizeX,
    sizeZ
  } = terrainState;

  const positions =
    new Float32Array(
      heights.length * 3
    );

  const colors =
    new Float32Array(
      heights.length * 3
    );

  const alpha =
    new Float32Array(
      heights.length
    );

  for (
    let z = 0;
    z < resolution;
    z++
  ) {
    for (
      let x = 0;
      x < resolution;
      x++
    ) {
      const index =
        z * resolution + x;

      positions[index * 3] =
        (
          x / (resolution - 1) -
          0.5
        ) *
        sizeX;

      positions[index * 3 + 1] =
        heights[index] + 0.08;

      positions[index * 3 + 2] =
        (
          z / (resolution - 1) -
          0.5
        ) *
        sizeZ;
    }
  }

  overlayGeometry =
    terrainMesh.geometry.clone();

  overlayGeometry
    .setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

  overlayGeometry
    .setAttribute(
      "overlayColor",
      new THREE.BufferAttribute(
        colors,
        3
      )
    );

  overlayGeometry
    .setAttribute(
      "overlayAlpha",
      new THREE.BufferAttribute(
        alpha,
        1
      )
    );

  overlayMaterial =
    new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 overlayColor;
        attribute float overlayAlpha;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = overlayColor;
          vAlpha = overlayAlpha;

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          gl_FragColor =
            vec4(vColor, vAlpha);
        }
      `,

      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide
    });

  overlayMesh =
    new THREE.Mesh(
      overlayGeometry,
      overlayMaterial
    );

  overlayMesh.renderOrder = 2;
  overlayMesh.visible =
    params.showChangeOverlay;

  scene.add(overlayMesh);

  updateOverlay();
}


function updateOverlay() {
  if (!overlayGeometry || !terrainState) {
    return;
  }

  const positions =
    overlayGeometry
      .getAttribute("position")
      .array;

  const colors =
    overlayGeometry
      .getAttribute("overlayColor")
      .array;

  const alpha =
    overlayGeometry
      .getAttribute("overlayAlpha")
      .array;

  const {
    heights,
    originalHeights
  } = terrainState;

  const scale =
    Math.max(
      params.changeOverlayScale,
      0.000001
    );

  for (
    let i = 0;
    i < heights.length;
    i++
  ) {
    const delta =
      heights[i] -
      originalHeights[i];

    positions[i * 3 + 1] =
      heights[i] + 0.08;

    const intensity =
      clamp(
        Math.abs(delta) / scale,
        0,
        1
      );

    if (Math.abs(delta) < 0.000001) {
      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0;
      colors[i * 3 + 2] = 0;
      alpha[i] = 0;
    } else if (delta > 0) {
      colors[i * 3] = 0.05;
      colors[i * 3 + 1] = 0.35;
      colors[i * 3 + 2] = 1;
      alpha[i] =
        0.1 +
        intensity * 0.7;
    } else {
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.06;
      colors[i * 3 + 2] = 0.03;
      alpha[i] =
        0.1 +
        intensity * 0.7;
    }
  }

  overlayGeometry
    .getAttribute("position")
    .needsUpdate = true;

  overlayGeometry
    .getAttribute("overlayColor")
    .needsUpdate = true;

  overlayGeometry
    .getAttribute("overlayAlpha")
    .needsUpdate = true;
}


function updateOverlayVisibility() {
  params.showChangeOverlay =
    ui.showChangeOverlay.checked;

  ui.changeLegend.classList.toggle(
    "hidden",
    !params.showChangeOverlay
  );

  if (overlayMesh) {
    overlayMesh.visible =
      params.showChangeOverlay;
  }
}


/* -------------------------------------------------------------------------- */
/* Camera                                                                     */
/* -------------------------------------------------------------------------- */

function fitCamera() {
  if (!terrainMesh) {
    return;
  }

  const box =
    terrainMesh.geometry.boundingBox;

  const size =
    box.getSize(
      new THREE.Vector3()
    );

  const center =
    box.getCenter(
      new THREE.Vector3()
    );

  const dimension =
    Math.max(
      size.x,
      size.y,
      size.z
    );

  camera.near =
    Math.max(
      0.1,
      dimension / 10000
    );

  camera.far =
    Math.max(
      10000,
      dimension * 20
    );

  camera.updateProjectionMatrix();

  camera.position.set(
    center.x + dimension * 0.72,
    center.y + dimension * 0.62,
    center.z + dimension * 0.72
  );

  controls.target.copy(center);
  controls.target.y += dimension * 0.08;
  controls.update();
}


/* -------------------------------------------------------------------------- */
/* Source visualisation                                                       */
/* -------------------------------------------------------------------------- */

function sourcePolygon() {
  const side =
    Math.sqrt(
      Math.max(
        params.sourceArea,
        1
      )
    );

  const half =
    side * 0.5;

  return [
    new THREE.Vector2(
      source.center.x - half,
      source.center.y - half
    ),

    new THREE.Vector2(
      source.center.x + half,
      source.center.y - half
    ),

    new THREE.Vector2(
      source.center.x + half,
      source.center.y + half
    ),

    new THREE.Vector2(
      source.center.x - half,
      source.center.y + half
    )
  ];
}


function disposeObject(object) {
  if (!object) {
    return;
  }

  sourceGroup.remove(object);

  if (object.geometry) {
    object.geometry.dispose();
  }

  if (object.material) {
    object.material.dispose();
  }
}


function updateSourceVisuals() {
  if (!terrainState) {
    return;
  }

  disposeObject(sourceOutline);
  disposeObject(sourceVolumeWire);

  const polygon =
    sourcePolygon();

  const outlinePoints =
    polygon.map(
      (point) =>
        new THREE.Vector3(
          point.x,
          terrainHeightAt(
            point.x,
            point.y
          ) + 0.15,
          point.y
        )
    );

  const outlineGeometry =
    new THREE.BufferGeometry()
      .setFromPoints(outlinePoints);

  sourceOutline =
    new THREE.LineLoop(
      outlineGeometry,
      new THREE.LineBasicMaterial({
        color: 0xffffff
      })
    );

  sourceGroup.add(sourceOutline);

  const height =
    Math.max(
      params.sourceVolume /
      Math.max(
        params.sourceArea,
        1
      ),
      particles?.stackHeight || 5
    );

  const linePoints = [];

  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    const a = polygon[i];
    const b =
      polygon[
        (i + 1) % polygon.length
      ];

    const ay =
      terrainHeightAt(a.x, a.y) + 0.08;

    const by =
      terrainHeightAt(b.x, b.y) + 0.08;

    linePoints.push(
      new THREE.Vector3(a.x, ay, a.y),
      new THREE.Vector3(b.x, by, b.y),

      new THREE.Vector3(a.x, ay + height, a.y),
      new THREE.Vector3(b.x, by + height, b.y),

      new THREE.Vector3(a.x, ay, a.y),
      new THREE.Vector3(a.x, ay + height, a.y)
    );
  }

  const volumeGeometry =
    new THREE.BufferGeometry()
      .setFromPoints(linePoints);

  sourceVolumeWire =
    new THREE.LineSegments(
      volumeGeometry,
      new THREE.LineBasicMaterial({
        color: 0x9eaca5,
        transparent: true,
        opacity: 0.45
      })
    );

  sourceGroup.add(sourceVolumeWire);

  sourceGroup.visible =
    !params.running;
}


/* -------------------------------------------------------------------------- */
/* Particle generation                                                        */
/* -------------------------------------------------------------------------- */

function startDirection(x, z) {
  let dx = 0;
  let dz = 1;

  if (
    params.startDirectionMode ===
    "downhill"
  ) {
    const normal =
      terrainNormalAt(x, z);

    dx = -normal.x;
    dz = -normal.z;
  }

  if (
    params.startDirectionMode ===
    "fixed"
  ) {
    const angle =
      THREE.MathUtils.degToRad(
        params.directionAngle
      );

    dx = Math.sin(angle);
    dz = Math.cos(angle);
  }

  if (
    params.startDirectionMode ===
    "radial"
  ) {
    dx =
      x -
      source.center.x;

    dz =
      z -
      source.center.y;

    if (
      Math.hypot(dx, dz) < 0.001
    ) {
      dx = 0;
      dz = 1;
    }
  }

  const length =
    Math.hypot(dx, dz) || 1;

  return new THREE.Vector2(
    dx / length,
    dz / length
  );
}


function generateParticles() {
  const count =
    Math.min(
      requestedParticleCount(),
      MAX_PARTICLES
    );

  const parcelVolume =
    params.sourceVolume /
    count;

  const radius =
    Math.cbrt(
      parcelVolume * 3 /
      (4 * Math.PI)
    );

  const positions =
    new Float32Array(
      count * 3
    );

  const velocities =
    new Float32Array(
      count * 3
    );

  const lastPositions =
    new Float32Array(
      count * 3
    );

  const distances =
    new Float32Array(count);

  const settled =
    new Float32Array(count);

  const remaining =
    new Float32Array(count);

  remaining.fill(1);

  const side =
    Math.sqrt(
      Math.max(
        params.sourceArea,
        1
      )
    );

  const grid =
    Math.ceil(
      Math.sqrt(count)
    );

  const spacing =
    side /
    Math.max(
      grid,
      1
    );

  let index = 0;
  let stackHeight = 0;

  for (
    let layer = 0;
    index < count;
    layer++
  ) {
    for (
      let row = 0;
      row < grid && index < count;
      row++
    ) {
      for (
        let column = 0;
        column < grid && index < count;
        column++
      ) {
        const x =
          source.center.x -
          side * 0.5 +
          spacing * (
            column + 0.5
          );

        const z =
          source.center.y -
          side * 0.5 +
          spacing * (
            row + 0.5
          );

        const terrainY =
          terrainHeightAt(x, z);

        const y =
          terrainY +
          radius +
          PARTICLE_CLEARANCE +
          layer *
          radius *
          2.05;

        const p =
          index * 3;

        positions[p] = x;
        positions[p + 1] = y;
        positions[p + 2] = z;

        const direction =
          startDirection(x, z);

        velocities[p] =
          direction.x *
          params.startVelocity;

        velocities[p + 1] = 0;

        velocities[p + 2] =
          direction.y *
          params.startVelocity;

        lastPositions[p] = x;
        lastPositions[p + 1] = y;
        lastPositions[p + 2] = z;

        index++;
        stackHeight =
          Math.max(
            stackHeight,
            layer * radius * 2.05
          );
      }
    }
  }

  particles = {
    count,
    positions,
    velocities,
    lastPositions,
    distances,
    settled,
    remaining,
    radius,
    parcelVolume,
    stackHeight
  };

  updateParticleCountReadout();
}


/* -------------------------------------------------------------------------- */
/* Particle rendering                                                         */
/* -------------------------------------------------------------------------- */

function createParticleVisual() {
  if (particlePoints) {
    scene.remove(particlePoints);
    particleGeometry.dispose();
    particleMaterial.dispose();
  }

  particleGeometry =
    new THREE.BufferGeometry();

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      particles.positions,
      3
    )
  );

  particleGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(
      new Float32Array(
        particles.count * 3
      ),
      3
    )
  );

  particleMaterial =
    new THREE.ShaderMaterial({
      uniforms: {
        size: {
          value:
            particles.radius *
            2 *
            params.particleSize
        }
      },

      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        uniform float size;

        void main() {
          vColor = color;

          vec4 mvPosition =
            modelViewMatrix *
            vec4(position, 1.0);

          gl_PointSize =
            clamp(
              size *
              (900.0 / max(1.0, -mvPosition.z)),
              2.0,
              80.0
            );

          gl_Position =
            projectionMatrix *
            mvPosition;
        }
      `,

      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 p =
            gl_PointCoord -
            vec2(0.5);

          if (length(p) > 0.5) {
            discard;
          }

          gl_FragColor =
            vec4(vColor, 0.96);
        }
      `,

      transparent: true,
      depthWrite: false
    });

  particlePoints =
    new THREE.Points(
      particleGeometry,
      particleMaterial
    );

  particlePoints.frustumCulled = false;

  scene.add(particlePoints);

  updateParticleColours();
}


function colourFromMap(value, target) {
  const t =
    clamp(value, 0, 1);

  const scaled =
    t *
    (COLOR_MAP.length - 1);

  const index =
    Math.min(
      COLOR_MAP.length - 2,
      Math.floor(scaled)
    );

  const fraction =
    scaled - index;

  target.copy(
    COLOR_MAP[index]
  ).lerp(
    COLOR_MAP[index + 1],
    fraction
  );
}


function updateParticleColours() {
  if (!particles || !particleGeometry) {
    return;
  }

  const colours =
    particleGeometry
      .getAttribute("color")
      .array;

  let maxSpeed = 0;
  let maxDistance = 0;

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const p = i * 3;

    maxSpeed =
      Math.max(
        maxSpeed,
        Math.hypot(
          particles.velocities[p],
          particles.velocities[p + 1],
          particles.velocities[p + 2]
        )
      );

    maxDistance =
      Math.max(
        maxDistance,
        particles.distances[i]
      );
  }

  const cell =
    Math.max(
      particles.radius * 4,
      5
    );

  const thickness =
    new Map();

  if (
    params.colorMode ===
    "thickness"
  ) {
    for (
      let i = 0;
      i < particles.count;
      i++
    ) {
      const p = i * 3;

      const key =
        `${Math.floor(
          particles.positions[p] / cell
        )}:${
          Math.floor(
            particles.positions[p + 2] / cell
          )
        }`;

      thickness.set(
        key,
        (thickness.get(key) || 0) +
        particles.parcelVolume
      );
    }
  }

  let maxThickness = 0;

  for (const volume of thickness.values()) {
    maxThickness =
      Math.max(
        maxThickness,
        volume / (cell * cell)
      );
  }

  const colour =
    new THREE.Color();

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const p = i * 3;
    let value = 0;

    if (
      params.colorMode ===
      "distance"
    ) {
      value =
        maxDistance > 0
          ? particles.distances[i] /
            maxDistance
          : 0;
    } else if (
      params.colorMode ===
      "thickness"
    ) {
      const key =
        `${Math.floor(
          particles.positions[p] / cell
        )}:${
          Math.floor(
            particles.positions[p + 2] / cell
          )
        }`;

      const localThickness =
        (
          thickness.get(key) || 0
        ) /
        (cell * cell);

      value =
        maxThickness > 0
          ? localThickness / maxThickness
          : 0;
    } else {
      const speed =
        Math.hypot(
          particles.velocities[p],
          particles.velocities[p + 1],
          particles.velocities[p + 2]
        );

      value =
        maxSpeed > 0
          ? speed / maxSpeed
          : 0.15;
    }

    colourFromMap(value, colour);

    colours[p] = colour.r;
    colours[p + 1] = colour.g;
    colours[p + 2] = colour.b;
  }

  particleGeometry
    .getAttribute("color")
    .needsUpdate = true;

  particleMaterial.uniforms.size.value =
    clamp(
      particles.radius *
      2 *
      params.particleSize,
      0.15,
      8
    );
}


/* -------------------------------------------------------------------------- */
/* Physics                                                                    */
/* -------------------------------------------------------------------------- */

function particleSurface(x, z) {
  return (
    terrainHeightAt(x, z) +
    particles.radius +
    PARTICLE_CLEARANCE
  );
}


function isNearTerrain(x, y, z) {
  return (
    y <=
    particleSurface(x, z) +
    CONTACT_TOLERANCE
  );
}


function applyCohesion(dt) {
  if (
    params.particleCohesion <= 0
  ) {
    return;
  }

  const radius =
    particles.radius;

  const restDistance =
    radius *
    INTERNAL_COHESION_REST_DISTANCE;

  const range =
    radius *
    INTERNAL_COHESION_RANGE;

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const pi = i * 3;

    for (
      let j = i + 1;
      j < particles.count;
      j++
    ) {
      const pj = j * 3;

      const dx =
        particles.positions[pj] -
        particles.positions[pi];

      const dy =
        particles.positions[pj + 1] -
        particles.positions[pi + 1];

      const dz =
        particles.positions[pj + 2] -
        particles.positions[pi + 2];

      const distance =
        Math.hypot(dx, dy, dz);

      if (
        distance <= restDistance ||
        distance >= range ||
        distance < 0.000001
      ) {
        continue;
      }

      const amount =
        (
          distance -
          restDistance
        ) /
        (
          range -
          restDistance
        );

      const impulse =
        params.particleCohesion *
        INTERNAL_COHESION_STRENGTH *
        amount *
        dt;

      const nx = dx / distance;
      const ny = dy / distance;
      const nz = dz / distance;

      particles.velocities[pi] += nx * impulse;
      particles.velocities[pi + 1] += ny * impulse;
      particles.velocities[pi + 2] += nz * impulse;

      particles.velocities[pj] -= nx * impulse;
      particles.velocities[pj + 1] -= ny * impulse;
      particles.velocities[pj + 2] -= nz * impulse;
    }
  }
}


function integrateParticles(dt) {
  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const p = i * 3;

    let x = particles.positions[p];
    let y = particles.positions[p + 1];
    let z = particles.positions[p + 2];

    let vx = particles.velocities[p];
    let vy = particles.velocities[p + 1];
    let vz = particles.velocities[p + 2];

    const contact =
      isNearTerrain(x, y, z);

    let nx = 0;
    let ny = 1;
    let nz = 0;

    if (contact) {
      const normal =
        terrainNormalAt(x, z);

      nx = normal.x;
      ny = normal.y;
      nz = normal.z;
    }

    let gx = 0;
    let gy = -GRAVITY;
    let gz = 0;

    if (contact) {
      const normalGravity =
        gy * ny;

      gx -= normalGravity * nx;
      gy -= normalGravity * ny;
      gz -= normalGravity * nz;
    }

    vx += gx * dt;
    vy += gy * dt;
    vz += gz * dt;

    if (contact) {
      const normalVelocity =
        vx * nx +
        vy * ny +
        vz * nz;

      let tx =
        vx -
        nx * normalVelocity;

      let ty =
        vy -
        ny * normalVelocity;

      let tz =
        vz -
        nz * normalVelocity;

      const tangentSpeed =
        Math.hypot(tx, ty, tz);

      if (tangentSpeed > 0.000001) {
        const drag =
          tangentSpeed *
          tangentSpeed /
          INTERNAL_TERRAIN_DRAG_LENGTH;

        const factor =
          Math.max(
            0,
            1 -
            drag * dt /
            tangentSpeed
          );

        tx *= factor;
        ty *= factor;
        tz *= factor;

        vx =
          tx +
          nx * normalVelocity;

        vy =
          ty +
          ny * normalVelocity;

        vz =
          tz +
          nz * normalVelocity;
      }
    }

    particles.positions[p] =
      x + vx * dt;

    particles.positions[p + 1] =
      y + vy * dt;

    particles.positions[p + 2] =
      z + vz * dt;

    particles.velocities[p] = vx;
    particles.velocities[p + 1] = vy;
    particles.velocities[p + 2] = vz;
  }
}


function resolveTerrainContacts(dt) {
  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const p = i * 3;

    const x =
      particles.positions[p];

    const z =
      particles.positions[p + 2];

    const surface =
      particleSurface(x, z);

    if (
      particles.positions[p + 1] >
      surface
    ) {
      continue;
    }

    particles.positions[p + 1] =
      surface;

    const normal =
      terrainNormalAt(x, z);

    let vx =
      particles.velocities[p];

    let vy =
      particles.velocities[p + 1];

    let vz =
      particles.velocities[p + 2];

    const normalVelocity =
      vx * normal.x +
      vy * normal.y +
      vz * normal.z;

    if (normalVelocity < 0) {
      vx -= normal.x * normalVelocity;
      vy -= normal.y * normalVelocity;
      vz -= normal.z * normalVelocity;
    }

    const correctedNormalVelocity =
      Math.max(
        vx * normal.x +
        vy * normal.y +
        vz * normal.z,
        0
      );

    let tx =
      vx -
      normal.x *
      correctedNormalVelocity;

    let ty =
      vy -
      normal.y *
      correctedNormalVelocity;

    let tz =
      vz -
      normal.z *
      correctedNormalVelocity;

    const speed =
      Math.hypot(tx, ty, tz);

    const slope =
      Math.sqrt(
        Math.max(
          0,
          1 -
          normal.y * normal.y
        )
      );

    const support =
      Math.max(
        normal.y,
        0.1
      );

    const kineticFriction =
      params.particleTerrainFriction *
      GRAVITY *
      support;

    const staticFriction =
      params.particleTerrainFriction *
      INTERNAL_STATIC_FRICTION_MULTIPLIER *
      GRAVITY *
      support;

    const downhillAcceleration =
      GRAVITY * slope;

    if (
      speed < SETTLE_SPEED &&
      downhillAcceleration <= staticFriction
    ) {
      tx = 0;
      ty = 0;
      tz = 0;
    } else if (speed > 0.000001) {
      const factor =
        Math.max(
          0,
          (
            speed -
            kineticFriction * dt
          ) /
          speed
        );

      tx *= factor;
      ty *= factor;
      tz *= factor;
    }

    particles.velocities[p] =
      tx +
      normal.x *
      correctedNormalVelocity;

    particles.velocities[p + 1] =
      ty +
      normal.y *
      correctedNormalVelocity;

    particles.velocities[p + 2] =
      tz +
      normal.z *
      correctedNormalVelocity;
  }
}


function resolveParticleContacts() {
  const diameter =
    Math.max(
      particles.radius * 2,
      0.1
    );

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const pi = i * 3;

    for (
      let j = i + 1;
      j < particles.count;
      j++
    ) {
      const pj = j * 3;

      const dx =
        particles.positions[pj] -
        particles.positions[pi];

      const dy =
        particles.positions[pj + 1] -
        particles.positions[pi + 1];

      const dz =
        particles.positions[pj + 2] -
        particles.positions[pi + 2];

      const distance =
        Math.hypot(dx, dy, dz);

      if (
        distance >= diameter ||
        distance < 0.000001
      ) {
        continue;
      }

      const nx = dx / distance;
      const ny = dy / distance;
      const nz = dz / distance;

      const overlap =
        diameter - distance;

      const correction =
        overlap * 0.5 * 0.9;

      particles.positions[pi] -= nx * correction;
      particles.positions[pi + 1] -= ny * correction;
      particles.positions[pi + 2] -= nz * correction;

      particles.positions[pj] += nx * correction;
      particles.positions[pj + 1] += ny * correction;
      particles.positions[pj + 2] += nz * correction;

      const rvx =
        particles.velocities[pi] -
        particles.velocities[pj];

      const rvy =
        particles.velocities[pi + 1] -
        particles.velocities[pj + 1];

      const rvz =
        particles.velocities[pi + 2] -
        particles.velocities[pj + 2];

      const normalVelocity =
        rvx * nx +
        rvy * ny +
        rvz * nz;

      if (normalVelocity > 0) {
        const impulse =
          normalVelocity * 0.5;

        particles.velocities[pi] -= nx * impulse;
        particles.velocities[pi + 1] -= ny * impulse;
        particles.velocities[pi + 2] -= nz * impulse;

        particles.velocities[pj] += nx * impulse;
        particles.velocities[pj + 1] += ny * impulse;
        particles.velocities[pj + 2] += nz * impulse;
      }

      const tx =
        rvx -
        nx * normalVelocity;

      const ty =
        rvy -
        ny * normalVelocity;

      const tz =
        rvz -
        nz * normalVelocity;

      const tangentSpeed =
        Math.hypot(tx, ty, tz);

      if (tangentSpeed > 0.000001) {
        const friction =
          Math.min(
            tangentSpeed * 0.5,
            params.particleParticleFriction *
            Math.abs(normalVelocity) *
            0.5
          );

        const damping =
          tangentSpeed *
          INTERNAL_CONTACT_DAMPING *
          0.5;

        const impulse =
          Math.min(
            tangentSpeed * 0.5,
            friction + damping
          );

        const ux = tx / tangentSpeed;
        const uy = ty / tangentSpeed;
        const uz = tz / tangentSpeed;

        particles.velocities[pi] -= ux * impulse;
        particles.velocities[pi + 1] -= uy * impulse;
        particles.velocities[pi + 2] -= uz * impulse;

        particles.velocities[pj] += ux * impulse;
        particles.velocities[pj + 1] += uy * impulse;
        particles.velocities[pj + 2] += uz * impulse;
      }
    }
  }
}


/* -------------------------------------------------------------------------- */
/* Terrain evolution                                                          */
/* -------------------------------------------------------------------------- */

function addTerrainChange(x, z, volume) {
  if (!terrainState) {
    return;
  }

  const c =
    terrainCoordinates(x, z);

  const {
    resolution,
    sizeX,
    sizeZ
  } = terrainState;

  const cellArea =
    (
      sizeX /
      (resolution - 1)
    ) *
    (
      sizeZ /
      (resolution - 1)
    );

  const delta =
    volume /
    Math.max(
      cellArea,
      0.000001
    );

  const indices = [
    [
      c.z0 * resolution + c.x0,
      (1 - c.tx) * (1 - c.tz)
    ],
    [
      c.z0 * resolution + c.x1,
      c.tx * (1 - c.tz)
    ],
    [
      c.z1 * resolution + c.x0,
      (1 - c.tx) * c.tz
    ],
    [
      c.z1 * resolution + c.x1,
      c.tx * c.tz
    ]
  ];

  for (const [
    index,
    weight
  ] of indices) {
    if (weight <= 0) {
      continue;
    }

    terrainState.pending[index] +=
      delta * weight;

    terrainState.touched.add(index);
  }
}


function terrainEvolution(dt) {
  if (
    !params.terrainEvolutionEnabled ||
    !terrainState
  ) {
    return;
  }

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const p = i * 3;

    if (
      !isNearTerrain(
        particles.positions[p],
        particles.positions[p + 1],
        particles.positions[p + 2]
      )
    ) {
      continue;
    }

    const x =
      particles.positions[p];

    const z =
      particles.positions[p + 2];

    const normal =
      terrainNormalAt(x, z);

    const vx =
      particles.velocities[p];

    const vy =
      particles.velocities[p + 1];

    const vz =
      particles.velocities[p + 2];

    const normalVelocity =
      vx * normal.x +
      vy * normal.y +
      vz * normal.z;

    const tx =
      vx -
      normal.x * normalVelocity;

    const ty =
      vy -
      normal.y * normalVelocity;

    const tz =
      vz -
      normal.z * normalVelocity;

    const speed =
      Math.hypot(tx, ty, tz);

    const slope =
      Math.sqrt(
        Math.max(
          0,
          1 -
          normal.y * normal.y
        )
      );

    if (
      speed >
      params.erosionStartSpeed &&
      slope > MIN_EROSION_SLOPE
    ) {
      const speedFactor =
        clamp(
          (
            speed -
            params.erosionStartSpeed
          ) /
          EROSION_SPEED_SCALE,
          0,
          1
        );

      const slopeFactor =
        clamp(
          (
            slope -
            MIN_EROSION_SLOPE
          ) /
          0.6,
          0,
          1
        );

      const activity =
        speedFactor *
        (
          0.25 +
          0.75 * slopeFactor
        );

      const volume =
        particles.parcelVolume *
        (
          params.erosionRate / 100
        ) *
        activity *
        dt *
        2;

      addTerrainChange(
        x,
        z,
        -volume
      );
    }

    if (
      particles.distances[i] > 0.5 &&
      particles.settled[i] > 0.1 &&
      speed < params.depositionSpeed &&
      particles.remaining[i] > 0
    ) {
      const activity =
        clamp(
          1 -
          speed /
          Math.max(
            params.depositionSpeed,
            0.000001
          ),
          0,
          1
        );

      const amount =
        particles.parcelVolume *
        (
          params.depositionRate / 100
        ) *
        activity *
        dt *
        2;

      const available =
        particles.parcelVolume *
        particles.remaining[i];

      const deposited =
        Math.min(
          amount,
          available
        );

      addTerrainChange(
        x,
        z,
        deposited
      );

      particles.remaining[i] =
        clamp(
          particles.remaining[i] -
          deposited /
          particles.parcelVolume,
          0,
          1
        );
    }
  }

  terrainState.evolutionTime += dt;

  if (
    terrainState.evolutionTime <
    TERRAIN_UPDATE_INTERVAL
  ) {
    return;
  }

  terrainState.evolutionTime = 0;

  for (const index of terrainState.touched) {
    const delta =
      clamp(
        terrainState.pending[index],
        -MAX_TERRAIN_CHANGE_PER_UPDATE,
        MAX_TERRAIN_CHANGE_PER_UPDATE
      );

    terrainState.heights[index] =
      Math.max(
        0,
        terrainState.heights[index] +
        delta
      );

    terrainState.pending[index] = 0;
  }

  terrainState.touched.clear();

  refreshTerrainGeometry();
}


/* -------------------------------------------------------------------------- */
/* Physics update                                                             */
/* -------------------------------------------------------------------------- */

function updatePhysics(dt) {
  if (!particles) {
    return;
  }

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const p = i * 3;

    particles.lastPositions[p] =
      particles.positions[p];

    particles.lastPositions[p + 1] =
      particles.positions[p + 1];

    particles.lastPositions[p + 2] =
      particles.positions[p + 2];
  }

  applyCohesion(dt);
  integrateParticles(dt);
  resolveParticleContacts();
  resolveTerrainContacts(dt);
  terrainEvolution(dt);

  let allSettled = true;

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const p = i * 3;

    const dx =
      particles.positions[p] -
      particles.lastPositions[p];

    const dy =
      particles.positions[p + 1] -
      particles.lastPositions[p + 1];

    const dz =
      particles.positions[p + 2] -
      particles.lastPositions[p + 2];

    const movement =
      Math.hypot(dx, dy, dz);

    particles.distances[i] += movement;

    const speed =
      Math.hypot(
        particles.velocities[p],
        particles.velocities[p + 1],
        particles.velocities[p + 2]
      );

    if (
      speed < SETTLE_SPEED &&
      movement < 0.001
    ) {
      particles.settled[i] += dt;

      if (
        particles.settled[i] > 0.25
      ) {
        particles.velocities[p] = 0;
        particles.velocities[p + 1] = 0;
        particles.velocities[p + 2] = 0;
      }
    } else {
      particles.settled[i] = 0;
    }

    if (
      particles.settled[i] <
      SETTLE_TIME
    ) {
      allSettled = false;
    }
  }

  simulationTime += dt;

  if (
    simulationTime > 0.7 &&
    allSettled
  ) {
    params.running = false;
    ui.playButton.textContent = "PLAY";
    setStatus("FINISHED");
  }
}


/* -------------------------------------------------------------------------- */
/* Simulation controls                                                        */
/* -------------------------------------------------------------------------- */

function resetSimulation() {
  params.running = false;
  simulationTime = 0;
  simulationAccumulator = 0;

  if (terrainState) {
    terrainState.heights.set(
      terrainState.originalHeights
    );

    terrainState.pending.fill(0);
    terrainState.touched.clear();
    terrainState.evolutionTime = 0;

    refreshTerrainGeometry();
  }

  generateParticles();
  createParticleVisual();
  updateSourceVisuals();

  ui.playButton.textContent = "PLAY";
  setStatus("PAUSED");
}


function startSimulation() {
  if (!particles) {
    resetSimulation();
  }

  params.running = true;
  sourceGroup.visible = false;
  ui.playButton.textContent = "PAUSE";
  setStatus("RUNNING");
}


function pauseSimulation() {
  params.running = false;
  ui.playButton.textContent = "PLAY";
  setStatus("PAUSED");
}


ffunction animateSimulation(realDelta) {
  if (!params.running) {
    return;
  }

  simulationAccumulator +=
    Math.min(realDelta, 0.1) *
    params.simulationSpeed;

  let steps = 0;

  while (
    simulationAccumulator >= PHYSICS_STEP &&
    steps < MAX_SUBSTEPS &&
    params.running
  ) {
    updatePhysics(PHYSICS_STEP);

    simulationAccumulator -=
      PHYSICS_STEP;

    steps++;
  }

  if (particleGeometry) {
    const positionAttribute =
      particleGeometry.getAttribute(
        "position"
      );

    if (positionAttribute) {
      positionAttribute.needsUpdate = true;
    }
  }

  updateParticleColours();
}


/* -------------------------------------------------------------------------- */
/* Pointer interaction                                                        */
/* -------------------------------------------------------------------------- */

function terrainPointFromPointer(event) {
  const rectangle =
    renderer.domElement
      .getBoundingClientRect();

  pointer.x =
    (
      (
        event.clientX -
        rectangle.left
      ) /
      rectangle.width
    ) *
    2 -
    1;

  pointer.y =
    -(
      (
        event.clientY -
        rectangle.top
      ) /
      rectangle.height
    ) *
    2 +
    1;

  raycaster.setFromCamera(
    pointer,
    camera
  );

  const hits =
    raycaster.intersectObject(
      terrainMesh,
      false
    );

  if (!hits.length) {
    return null;
  }

  return new THREE.Vector2(
    hits[0].point.x,
    hits[0].point.z
  );
}


renderer.domElement.addEventListener(
  "pointerdown",
  (event) => {
    if (
      event.button !== 0 ||
      !event.shiftKey ||
      params.running
    ) {
      return;
    }

    const point =
      terrainPointFromPointer(event);

    if (!point) {
      return;
    }

    event.preventDefault();

    source.center.copy(point);
    updateSourceVisuals();
    resetSimulation();

    setStatus("SOURCE MOVED");
  },
  true
);


/* -------------------------------------------------------------------------- */
/* Imported terrain                                                           */
/* -------------------------------------------------------------------------- */

function extractObjectPoints(object) {
  const points = [];

  object.updateMatrixWorld(true);

  object.traverse((child) => {
    if (
      !child.isMesh ||
      !child.geometry
    ) {
      return;
    }

    const position =
      child.geometry
        .getAttribute("position");

    if (!position) {
      return;
    }

    const point =
      new THREE.Vector3();

    for (
      let i = 0;
      i < position.count;
      i++
    ) {
      point.fromBufferAttribute(
        position,
        i
      );

      point.applyMatrix4(
        child.matrixWorld
      );

      points.push(
        point.clone()
      );
    }
  });

  return points;
}


function importedPointsToTerrain(points) {
  if (!points.length) {
    createProceduralTerrain();
    return;
  }

  const rotation =
    new THREE.Euler(
      THREE.MathUtils.degToRad(
        -90 + params.rotationX
      ),
      THREE.MathUtils.degToRad(
        params.rotationY
      ),
      THREE.MathUtils.degToRad(
        params.rotationZ
      ),
      "XYZ"
    );

  const transformed =
    points.map(
      (point) =>
        point.clone().applyEuler(rotation)
    );

  const bounds =
    new THREE.Box3()
      .setFromPoints(transformed);

  const rawSize =
    bounds.getSize(
      new THREE.Vector3()
    );

  const resolution =
    Math.round(
      clamp(
        params.terrainResolution,
        64,
        384
      )
    );

  const sizeX =
    TERRAIN_SIZE *
    params.modelScale;

  const sizeZ =
    TERRAIN_SIZE *
    params.modelScale *
    params.depthScale;

  const heights =
    new Float32Array(
      resolution * resolution
    );

  heights.fill(-Infinity);

  for (const point of transformed) {
    const nx =
      clamp(
        (
          point.x -
          bounds.min.x
        ) /
        Math.max(rawSize.x, 0.000001),
        0,
        1
      );

    const nz =
      clamp(
        (
          point.z -
          bounds.min.z
        ) /
        Math.max(rawSize.z, 0.000001),
        0,
        1
      );

    const x =
      Math.round(
        nx * (resolution - 1)
      );

    const z =
      Math.round(
        nz * (resolution - 1)
      );

    const index =
      z * resolution + x;

    heights[index] =
      Math.max(
        heights[index],
        point.y
      );
  }

  let lowest = Infinity;

  for (const value of heights) {
    if (Number.isFinite(value)) {
      lowest =
        Math.min(lowest, value);
    }
  }

  if (!Number.isFinite(lowest)) {
    lowest = bounds.min.y;
  }

  for (
    let i = 0;
    i < heights.length;
    i++
  ) {
    if (!Number.isFinite(heights[i])) {
      heights[i] = lowest;
    }

    heights[i] =
      (
        heights[i] -
        lowest
      ) *
      params.verticalExaggeration *
      params.modelScale;
  }

  createTerrain(
    heights,
    resolution,
    sizeX,
    sizeZ,
    "imported"
  );
}


async function loadTerrainFile(file) {
  if (!file) {
    return;
  }

  try {
    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    let points = [];

    if (extension === "obj") {
      const object =
        new OBJLoader()
          .parse(await file.text());

      points =
        extractObjectPoints(object);
    } else {
      const buffer =
        await file.arrayBuffer();

      const geometry =
        extension === "ply"
          ? new PLYLoader().parse(buffer)
          : new STLLoader().parse(buffer);

      const object =
        new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial()
        );

      points =
        extractObjectPoints(object);
    }

    importedRawPoints = points;
    importedPointsToTerrain(points);
    resetSimulation();

    setStatus(
      `IMPORTED ${extension.toUpperCase()}`
    );
  } catch (error) {
    console.error(error);
    setStatus("MODEL IMPORT FAILED");
  }
}


async function loadExampleTerrain() {
  try {
    setStatus("LOADING EXAMPLE TERRAIN");

    const response =
      await fetch(
        EXAMPLE_TERRAIN_URL
      );

    if (!response.ok) {
      throw new Error(
        "Could not load example terrain"
      );
    }

    const buffer =
      await response.arrayBuffer();

    const geometry =
      new STLLoader().parse(buffer);

    const object =
      new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial()
      );

    importedRawPoints =
      extractObjectPoints(object);

    importedPointsToTerrain(
      importedRawPoints
    );

    resetSimulation();
    setStatus("EXAMPLE TERRAIN LOADED");
  } catch (error) {
    console.error(error);
    setStatus("EXAMPLE TERRAIN FAILED");
  }
}


/* -------------------------------------------------------------------------- */
/* UI bindings                                                                */
/* -------------------------------------------------------------------------- */

bindRangeAndNumber(
  ui.particleTerrainFriction,
  ui.particleTerrainFrictionNumber,
  "particleTerrainFriction"
);

bindRangeAndNumber(
  ui.particleParticleFriction,
  ui.particleParticleFrictionNumber,
  "particleParticleFriction"
);

bindRangeAndNumber(
  ui.particleCohesion,
  ui.particleCohesionNumber,
  "particleCohesion"
);

bindRangeAndNumber(
  ui.startVelocity,
  ui.startVelocityNumber,
  "startVelocity",
  () => {},
  resetSimulation
);

bindRangeAndNumber(
  ui.simulationSpeed,
  ui.simulationSpeedNumber,
  "simulationSpeed"
);

bindRangeAndNumber(
  ui.directionAngle,
  ui.directionAngleNumber,
  "directionAngle",
  () => {},
  resetSimulation
);

bindRangeAndNumber(
  ui.changeOverlayScale,
  ui.changeOverlayScaleNumber,
  "changeOverlayScale",
  updateOverlay
);

bindRangeAndNumber(
  ui.erosionRate,
  ui.erosionRateNumber,
  "erosionRate"
);

bindRangeAndNumber(
  ui.depositionRate,
  ui.depositionRateNumber,
  "depositionRate"
);

bindRangeAndNumber(
  ui.erosionStartSpeed,
  ui.erosionStartSpeedNumber,
  "erosionStartSpeed"
);

bindRangeAndNumber(
  ui.depositionSpeed,
  ui.depositionSpeedNumber,
  "depositionSpeed"
);

bindRangeAndNumber(
  ui.terrainResolution,
  ui.terrainResolutionNumber,
  "terrainResolution",
  () => {},
  () => {
    if (!params.running) {
      if (importedRawPoints) {
        importedPointsToTerrain(
          importedRawPoints
        );
      } else {
        createProceduralTerrain();
      }

      resetSimulation();
    }
  }
);

bindRangeAndNumber(
  ui.modelScale,
  ui.modelScaleNumber,
  "modelScale",
  () => {},
  () => {
    if (!params.running) {
      if (importedRawPoints) {
        importedPointsToTerrain(
          importedRawPoints
        );
      } else {
        createProceduralTerrain();
      }

      resetSimulation();
    }
  }
);

bindRangeAndNumber(
  ui.verticalExaggeration,
  ui.verticalExaggerationNumber,
  "verticalExaggeration",
  () => {},
  () => {
    if (!params.running) {
      if (importedRawPoints) {
        importedPointsToTerrain(
          importedRawPoints
        );
      } else {
        createProceduralTerrain();
      }

      resetSimulation();
    }
  }
);

bindRangeAndNumber(
  ui.depthScale,
  ui.depthScaleNumber,
  "depthScale",
  () => {},
  () => {
    if (!params.running) {
      if (importedRawPoints) {
        importedPointsToTerrain(
          importedRawPoints
        );
      } else {
        createProceduralTerrain();
      }

      resetSimulation();
    }
  }
);

bindRangeAndNumber(
  ui.sourceArea,
  ui.sourceAreaNumber,
  "sourceArea",
  updateSourceVisuals,
  resetSimulation
);

bindRangeAndNumber(
  ui.sourceVolume,
  ui.sourceVolumeNumber,
  "sourceVolume",
  () => {
    updateSourceVisuals();
    updateParticleCountReadout();
  },
  resetSimulation
);

bindRangeAndNumber(
  ui.particleDensity,
  ui.particleDensityNumber,
  "particleDensity",
  updateParticleCountReadout,
  resetSimulation
);

bindRangeAndNumber(
  ui.particleSize,
  ui.particleSizeNumber,
  "particleSize",
  updateParticleColours
);

bindRangeAndNumber(
  ui.rotationX,
  ui.rotationXNumber,
  "rotationX",
  () => {},
  () => {
    if (
      importedRawPoints &&
      !params.running
    ) {
      importedPointsToTerrain(
        importedRawPoints
      );

      resetSimulation();
    }
  }
);

bindRangeAndNumber(
  ui.rotationY,
  ui.rotationYNumber,
  "rotationY",
  () => {},
  () => {
    if (
      importedRawPoints &&
      !params.running
    ) {
      importedPointsToTerrain(
        importedRawPoints
      );

      resetSimulation();
    }
  }
);

bindRangeAndNumber(
  ui.rotationZ,
  ui.rotationZNumber,
  "rotationZ",
  () => {},
  () => {
    if (
      importedRawPoints &&
      !params.running
    ) {
      importedPointsToTerrain(
        importedRawPoints
      );

      resetSimulation();
    }
  }
);


ui.startDirectionMode.addEventListener(
  "change",
  () => {
    params.startDirectionMode =
      ui.startDirectionMode.value;

    ui.fixedDirectionControl
      .classList.toggle(
        "hidden",
        params.startDirectionMode !==
        "fixed"
      );

    resetSimulation();
  }
);


ui.terrainEvolutionEnabled.addEventListener(
  "change",
  () => {
    params.terrainEvolutionEnabled =
      ui.terrainEvolutionEnabled.checked;
  }
);


ui.showChangeOverlay.addEventListener(
  "change",
  updateOverlayVisibility
);


ui.colorMode.addEventListener(
  "change",
  () => {
    params.colorMode =
      ui.colorMode.value;

    updateParticleColours();
  }
);


ui.playButton.addEventListener(
  "click",
  () => {
    if (params.running) {
      pauseSimulation();
    } else {
      startSimulation();
    }
  }
);


ui.resetButton.addEventListener(
  "click",
  resetSimulation
);


ui.addButton.addEventListener(
  "click",
  () => {
    params.sourceVolume =
      clamp(
        params.sourceVolume + 1000,
        MIN_VOLUME,
        MAX_VOLUME
      );

    setPair(
      ui.sourceVolume,
      ui.sourceVolumeNumber,
      params.sourceVolume
    );

    updateParticleCountReadout();
    updateSourceVisuals();
    resetSimulation();
  }
);


ui.terrainButton.addEventListener(
  "click",
  () => {
    importedRawPoints = null;
    createProceduralTerrain();
    resetSimulation();
    setStatus("NEW ALPINE TERRAIN");
  }
);


ui.exampleTerrainButton.addEventListener(
  "click",
  loadExampleTerrain
);


ui.resetOrientationButton.addEventListener(
  "click",
  () => {
    params.rotationX = 0;
    params.rotationY = 0;
    params.rotationZ = 0;

    setPair(ui.rotationX, ui.rotationXNumber, 0);
    setPair(ui.rotationY, ui.rotationYNumber, 0);
    setPair(ui.rotationZ, ui.rotationZNumber, 0);

    if (importedRawPoints) {
      importedPointsToTerrain(
        importedRawPoints
      );

      resetSimulation();
    }
  }
);


ui.chooseModelButton.addEventListener(
  "click",
  () => ui.modelFileInput.click()
);


ui.dropZone.addEventListener(
  "click",
  () => ui.modelFileInput.click()
);


ui.modelFileInput.addEventListener(
  "change",
  () => {
    loadTerrainFile(
      ui.modelFileInput.files[0]
    );
  }
);


ui.dropZone.addEventListener(
  "dragover",
  (event) => {
    event.preventDefault();
    ui.dropZone.classList.add("dragover");
  }
);


ui.dropZone.addEventListener(
  "dragleave",
  () => {
    ui.dropZone.classList.remove("dragover");
  }
);


ui.dropZone.addEventListener(
  "drop",
  (event) => {
    event.preventDefault();

    ui.dropZone.classList.remove(
      "dragover"
    );

    loadTerrainFile(
      event.dataTransfer.files[0]
    );
  }
);


/* -------------------------------------------------------------------------- */
/* Read Me dialog                                                             */
/* -------------------------------------------------------------------------- */

const descriptionDialog =
  $("descriptionDialog");

$("openDescription").addEventListener(
  "click",
  () => {
    if (
      typeof descriptionDialog.showModal ===
      "function"
    ) {
      descriptionDialog.showModal();
    } else {
      descriptionDialog.setAttribute(
        "open",
        ""
      );
    }
  }
);


$("closeDescription").addEventListener(
  "click",
  () => {
    if (
      typeof descriptionDialog.close ===
      "function"
    ) {
      descriptionDialog.close();
    } else {
      descriptionDialog.removeAttribute(
        "open"
      );
    }
  }
);


descriptionDialog.addEventListener(
  "click",
  (event) => {
    if (
      event.target ===
      descriptionDialog
    ) {
      descriptionDialog.close();
    }
  }
);


/* -------------------------------------------------------------------------- */
/* Resize and animation                                                       */
/* -------------------------------------------------------------------------- */

function resize() {
  const width =
    ui.viewer.clientWidth;

  const height =
    ui.viewer.clientHeight;

  if (width <= 0 || height <= 0) {
    return;
  }

  renderer.setSize(
    width,
    height,
    false
  );

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();
}


window.addEventListener(
  "resize",
  resize
);


let previousTime =
  performance.now();


function animate(now) {
  const delta =
    Math.min(
      (now - previousTime) / 1000,
      0.1
    );

  previousTime = now;

  controls.update();
  animateSimulation(delta);

  renderer.render(
    scene,
    camera
  );

  requestAnimationFrame(
    animate
  );
}


/* -------------------------------------------------------------------------- */
/* Initialisation                                                             */
/* -------------------------------------------------------------------------- */

syncInterface();
resize();
createProceduralTerrain();
resetSimulation();

requestAnimationFrame(
  animate
);
