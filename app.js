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


function $(id) {
  const element =
    document.getElementById(id);

  if (!element) {
    throw new Error(
      `Missing HTML element with id "${id}".`
    );
  }

  return element;
}


const ui = {
  viewer: $("viewer"),

  materialFriction: $("materialFriction"),
  materialFrictionNumber: $("materialFrictionNumber"),

  terrainFriction: $("terrainFriction"),
  terrainFrictionNumber: $("terrainFrictionNumber"),

  staticFrictionFactor: $("staticFrictionFactor"),
  staticFrictionFactorNumber:
    $("staticFrictionFactorNumber"),

  particleCohesion: $("particleCohesion"),
  particleCohesionNumber:
    $("particleCohesionNumber"),

  cohesionRestDistanceFactor:
    $("cohesionRestDistanceFactor"),

  cohesionRestDistanceFactorNumber:
    $("cohesionRestDistanceFactorNumber"),

  contactDamping: $("contactDamping"),
  contactDampingNumber:
    $("contactDampingNumber"),

  flowDragLength: $("flowDragLength"),
  flowDragLengthNumber:
    $("flowDragLengthNumber"),

  startVelocity: $("startVelocity"),
  startVelocityNumber:
    $("startVelocityNumber"),

  simulationSpeed: $("simulationSpeed"),
  simulationSpeedNumber:
    $("simulationSpeedNumber"),

  startDirectionMode:
    $("startDirectionMode"),

  fixedDirectionControl:
    $("fixedDirectionControl"),

  directionAngle: $("directionAngle"),
  directionAngleNumber:
    $("directionAngleNumber"),

  userDirectionXControl:
    $("userDirectionXControl"),

  directionX: $("directionX"),
  directionXNumber:
    $("directionXNumber"),

  userDirectionZControl:
    $("userDirectionZControl"),

  directionZ: $("directionZ"),
  directionZNumber:
    $("directionZNumber"),

  terrainEvolutionEnabled:
    $("terrainEvolutionEnabled"),

  erosionRate: $("erosionRate"),
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

  modelScale: $("modelScale"),
  modelScaleNumber:
    $("modelScaleNumber"),

  metersPerModelUnit:
    $("metersPerModelUnit"),

  metersPerModelUnitNumber:
    $("metersPerModelUnitNumber"),

  verticalExaggeration:
    $("verticalExaggeration"),

  verticalScaleNumber:
    $("verticalScaleNumber"),

  depthScale: $("depthScale"),
  depthScaleNumber:
    $("depthScaleNumber"),

  releaseShapeMode:
    $("releaseShapeMode"),

  rectangleAreaControl:
    $("rectangleAreaControl"),

  sourceArea: $("sourceArea"),
  sourceAreaNumber:
    $("sourceAreaNumber"),

  customShapeControl:
    $("customShapeControl"),

  drawReleaseShapeButton:
    $("drawReleaseShapeButton"),

  clearReleaseShapeButton:
    $("clearReleaseShapeButton"),

  drawShapeHint:
    $("drawShapeHint"),

  releaseAreaReadout:
    $("releaseAreaReadout"),

  sourceVolume: $("sourceVolume"),
  sourceVolumeNumber:
    $("sourceVolumeNumber"),

  particleDensity:
    $("particleDensity"),

  particleDensityNumber:
    $("particleDensityNumber"),

  colorMode: $("colorMode"),

  particleSize: $("particleSize"),
  particleSizeNumber:
    $("particleSizeNumber"),

  rotationX: $("rotationX"),
  rotationXNumber:
    $("rotationXNumber"),

  rotationY: $("rotationY"),
  rotationYNumber:
    $("rotationYNumber"),

  rotationZ: $("rotationZ"),
  rotationZNumber:
    $("rotationZNumber"),

  resetOrientationButton:
    $("resetOrientationButton"),

  playButton: $("playButton"),
  resetButton: $("resetButton"),
  addButton: $("addButton"),
  terrainButton: $("terrainButton"),

exampleTerrainButton:
  $("exampleTerrainButton"),

dropZone: $("dropZone"),
  modelFileInput:
    $("modelFileInput"),

  chooseModelButton:
    $("chooseModelButton"),

  timelineWrap:
    $("timelineWrap"),

  timeline:
    $("timeline"),

  timelineReadout:
    $("timelineReadout"),

  status: $("status"),

  particleCountStatus:
    $("particleCountStatus")
};


/* ------------------------------------------------------------------------- */
/* Parameters                                                                */
/* ------------------------------------------------------------------------- */

const DEFAULT_PARAMS = {
  materialFriction: 0.35,
  terrainFriction: 0.65,
  staticFrictionFactor: 1.15,

  particleCohesion: 0.35,
  cohesionRestDistanceFactor: 2.1,
  contactDamping: 0.15,
  flowDragLength: 120,

  terrainEvolutionEnabled: true,
  erosionRate: 0.2,
  depositionRate: 1.5,
  erosionStartSpeed: 0.8,
  depositionSpeed: 0.18,

  startVelocity: 0,
  simulationSpeed: 1,

  startDirectionMode: "downhill",
  directionAngle: 0,
  directionX: 0,
  directionZ: 1,

  terrainResolution: 256,

  modelScale: 1,
  metersPerModelUnit: 1,
  verticalExaggeration: 1,
  depthScale: 1,

  releaseShapeMode: "rectangle",
  sourceArea: 3500,
  sourceVolume: 7000,
  particleDensity: 0.142857,

  colorMode: "velocity",
  particleSize: 2,

  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,

  minimumMovementSpeed: 0.12,

  running: false
};


const params = {
  ...DEFAULT_PARAMS
};


/* ------------------------------------------------------------------------- */
/* Constants                                                                 */
/* ------------------------------------------------------------------------- */

const TERRAIN_SIZE = 600;

const MIN_SOURCE_VOLUME = 1000;
const MAX_SOURCE_VOLUME = 500000;

const MAX_SIMULATED_PARTICLES = 4000;

const GRAVITY = 9.81;

const PHYSICS_STEP = 1 / 30;
const MAX_PHYSICS_SUBSTEPS = 8;

const COLLISION_ITERATIONS = 1;
const COLLISION_RESTITUTION = 0;

const SURFACE_CLEARANCE = 0.025;
const SURFACE_CONTACT_TOLERANCE = 0.05;

const STATIC_VELOCITY_THRESHOLD = 0.035;

const DEFAULT_IMPORTED_ROTATION_X = -90;

const COHESION_STRENGTH = 3;
const COHESION_RANGE_MULTIPLIER = 3;

const SETTLE_TIME = 0.65;

const CACHE_INTERVAL = 0.20;
const MAX_CACHE_FRAMES = 120;

const MAX_COLLISION_NEIGHBOURS = 64;
const MAX_COHESION_NEIGHBOURS = 32;

const INITIAL_PARTICLE_HORIZONTAL_SPACING = 2.04;
const INITIAL_PARTICLE_VERTICAL_SPACING = 2.04;

const TERRAIN_EVOLUTION_INTERVAL = 0.25;
const MIN_EROSION_SLOPE = 0.08;
const EROSION_SPEED_SCALE = 2.0;

const MAX_TERRAIN_CHANGE_PER_UPDATE = 0.03;


/* ------------------------------------------------------------------------- */
/* Colour map                                                                */
/* ------------------------------------------------------------------------- */

const MAKO_STOPS = [
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

const MAKO_COLORS =
  MAKO_STOPS.map(
    (hex) => new THREE.Color(hex)
  );


/* ------------------------------------------------------------------------- */
/* Three.js scene                                                            */
/* ------------------------------------------------------------------------- */

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
    antialias: true,
    alpha: false
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
controls.target.set(
  0,
  40,
  0
);


const hemisphereLight =
  new THREE.HemisphereLight(
    0xd8e6ff,
    0x202020,
    1.35
  );

scene.add(
  hemisphereLight
);


const sunLight =
  new THREE.DirectionalLight(
    0xffffff,
    2.0
  );

sunLight.position.set(
  220,
  420,
  160
);

sunLight.castShadow = true;

sunLight.shadow.mapSize.set(
  2048,
  2048
);

sunLight.shadow.camera.left = -500;
sunLight.shadow.camera.right = 500;
sunLight.shadow.camera.top = 500;
sunLight.shadow.camera.bottom = -500;

scene.add(
  sunLight
);


const terrainMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x777c78,
    roughness: 0.94,
    metalness: 0.02,
    side: THREE.DoubleSide
  });


const sourceGroup =
  new THREE.Group();

scene.add(
  sourceGroup
);


/* ------------------------------------------------------------------------- */
/* State                                                                     */
/* ------------------------------------------------------------------------- */

let sourceOutline = null;
let sourceVolumeWire = null;
let draftLine = null;

let terrainMesh = null;
let terrainState = null;
let importedRawPoints = null;

let particles = null;
let particleGeometry = null;
let particlePoints = null;
let particleMaterial = null;

let resetTimer = null;

let cacheFrames = [];
let replayMode = false;
let replayIndex = -1;

const source = {
  center: new THREE.Vector2(0, 0),
  customPolygonLocal: null,
  customArea: 0,
  drawing: false,
  draftWorld: []
};

const simulation = {
  started: false,
  time: 0,
  accumulator: 0,
  cacheAccumulator: 0,
  state: "paused"
};

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();

const terrainNormalScratch =
  new THREE.Vector3();


/* ------------------------------------------------------------------------- */
/* General helpers                                                           */
/* ------------------------------------------------------------------------- */

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}


function formatNumber(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 3
    }
  ).format(value);
}


function formatTime(value) {
  return `${value.toFixed(2)} s`;
}


function setStatus(text) {
  ui.status.textContent = text;
}


function setSliderAndNumber(
  rangeElement,
  numberElement,
  value
) {
  rangeElement.value =
    String(value);

  numberElement.value =
    String(value);
}


function syncInitialUi() {
  const pairs = [
    [
      ui.materialFriction,
      ui.materialFrictionNumber,
      "materialFriction"
    ],
    [
      ui.terrainFriction,
      ui.terrainFrictionNumber,
      "terrainFriction"
    ],
    [
      ui.staticFrictionFactor,
      ui.staticFrictionFactorNumber,
      "staticFrictionFactor"
    ],
    [
      ui.particleCohesion,
      ui.particleCohesionNumber,
      "particleCohesion"
    ],
    [
      ui.cohesionRestDistanceFactor,
      ui.cohesionRestDistanceFactorNumber,
      "cohesionRestDistanceFactor"
    ],
    [
      ui.contactDamping,
      ui.contactDampingNumber,
      "contactDamping"
    ],
    [
      ui.flowDragLength,
      ui.flowDragLengthNumber,
      "flowDragLength"
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
      ui.directionX,
      ui.directionXNumber,
      "directionX"
    ],
    [
      ui.directionZ,
      ui.directionZNumber,
      "directionZ"
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
      ui.metersPerModelUnit,
      ui.metersPerModelUnitNumber,
      "metersPerModelUnit"
    ],
    [
      ui.verticalExaggeration,
      ui.verticalScaleNumber,
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

  for (
    const [
      rangeElement,
      numberElement,
      parameterName
    ] of pairs
  ) {
    setSliderAndNumber(
      rangeElement,
      numberElement,
      params[parameterName]
    );
  }

  ui.terrainEvolutionEnabled.checked =
    params.terrainEvolutionEnabled;

  ui.startDirectionMode.value =
    params.startDirectionMode;

  ui.releaseShapeMode.value =
    params.releaseShapeMode;

  ui.colorMode.value =
    params.colorMode;
}


function bindRangeAndNumber(
  rangeElement,
  numberElement,
  parameterName,
  onInput = () => {},
  onCommit = () => {}
) {
  const update = (value) => {
    const numericValue =
      Number(value);

    if (
      !Number.isFinite(numericValue)
    ) {
      return;
    }

    const min =
      Number(rangeElement.min);

    const max =
      Number(rangeElement.max);

    params[parameterName] =
      clamp(
        numericValue,
        min,
        max
      );

    rangeElement.value =
      String(
        params[parameterName]
      );

    numberElement.value =
      String(
        params[parameterName]
      );

    onInput(
      params[parameterName]
    );
  };

  rangeElement.addEventListener(
    "input",
    () => {
      update(
        rangeElement.value
      );
    }
  );

  numberElement.addEventListener(
    "input",
    () => {
      update(
        numberElement.value
      );
    }
  );

  rangeElement.addEventListener(
    "change",
    () => {
      onCommit(
        params[parameterName]
      );
    }
  );

  numberElement.addEventListener(
    "change",
    () => {
      onCommit(
        params[parameterName]
      );
    }
  );
}


function requestParticleReset() {
  if (
    params.running
  ) {
    setStatus(
      "RESET REQUIRED FOR NEW PARAMETERS"
    );

    return;
  }

  clearTimeout(
    resetTimer
  );

  resetTimer =
    setTimeout(
      () => {
        resetSimulation();
      },
      140
    );
}


function requestedParticleCount() {
  const safeVolume =
    clamp(
      params.sourceVolume,
      MIN_SOURCE_VOLUME,
      MAX_SOURCE_VOLUME
    );

  return Math.max(
    1,
    Math.round(
      safeVolume *
      params.particleDensity
    )
  );
}


function updateParticleReadout() {
  const requested =
    requestedParticleCount();

  const simulated =
    Math.min(
      requested,
      MAX_SIMULATED_PARTICLES
    );

  if (
    requested > simulated
  ) {
    ui.particleCountStatus.textContent =
      `${formatNumber(requested)} requested · ` +
      `${formatNumber(simulated)} simulated`;
  } else {
    ui.particleCountStatus.textContent =
      `${formatNumber(simulated)} particles`;
  }
}


function updateDirectionVisibility() {
  const mode =
    params.startDirectionMode;

  ui.fixedDirectionControl.classList.toggle(
    "hidden",
    mode !== "fixed"
  );

  const vectorVisible =
    mode === "vector";

  ui.userDirectionXControl.classList.toggle(
    "hidden",
    !vectorVisible
  );

  ui.userDirectionZControl.classList.toggle(
    "hidden",
    !vectorVisible
  );
}


function updateShapeVisibility() {
  const isPolygon =
    params.releaseShapeMode === "polygon";

  ui.rectangleAreaControl.classList.toggle(
    "hidden",
    isPolygon
  );

  ui.customShapeControl.classList.toggle(
    "hidden",
    !isPolygon
  );

  if (
    isPolygon &&
    !source.customPolygonLocal
  ) {
    ui.releaseAreaReadout.textContent =
      "NO CUSTOM SHAPE";
  }
}


/* ------------------------------------------------------------------------- */
/* Terrain generation                                                        */
/* ------------------------------------------------------------------------- */

function fract(value) {
  return value -
    Math.floor(value);
}


function hash2(x, z) {
  const value =
    Math.sin(
      x * 127.1 +
      z * 311.7 +
      17.31
    ) *
    43758.5453123;

  return fract(value);
}


function valueNoise(x, z) {
  const x0 =
    Math.floor(x);

  const z0 =
    Math.floor(z);

  const tx =
    fract(x);

  const tz =
    fract(z);

  const sx =
    tx * tx * (3 - 2 * tx);

  const sz =
    tz * tz * (3 - 2 * tz);

  const a =
    hash2(x0, z0);

  const b =
    hash2(x0 + 1, z0);

  const c =
    hash2(x0, z0 + 1);

  const d =
    hash2(x0 + 1, z0 + 1);

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
  let normalisation = 0;

  for (
    let i = 0;
    i < octaves;
    i++
  ) {
    total +=
      valueNoise(
        x * frequency,
        z * frequency
      ) *
      amplitude;

    normalisation +=
      amplitude;

    amplitude *= 0.5;
    frequency *= 2;
  }

  return total /
    normalisation;
}


function alpineHeight(
  x,
  z,
  sizeX,
  sizeZ
) {
  const nx =
    x / sizeX;

  const nz =
    z / sizeZ;

  const warpX =
    (
      fbm(
        nx * 7 + 4.1,
        nz * 7 - 1.7,
        4
      ) - 0.5
    ) *
    0.075;

  const warpZ =
    (
      fbm(
        nx * 7 - 3.5,
        nz * 7 + 2.4,
        4
      ) - 0.5
    ) *
    0.075;

  const warpedX =
    nx + warpX;

  const warpedZ =
    nz + warpZ;

  const ridgeLine =
    0.035 *
      Math.sin(
        warpedX * 18
      ) +
    0.018 *
      Math.sin(
        warpedX * 43
      );

  const ridgeDistance =
    warpedZ -
    ridgeLine;

  const mainRidge =
    Math.exp(
      -Math.pow(
        ridgeDistance / 0.22,
        2
      )
    );

  const ridgeVariation =
    0.58 +
    0.42 *
      fbm(
        warpedX * 5.5 + 9,
        warpedZ * 5.5 - 4,
        5
      );

  const secondaryRidge =
    0.40 *
    Math.exp(
      -Math.pow(
        (
          warpedZ +
          0.26 +
          0.04 *
            Math.sin(
              warpedX * 12
            )
        ) /
          0.15,
        2
      )
    );

  const alpineNoise =
    fbm(
      warpedX * 8 + 20,
      warpedZ * 8 - 15,
      5
    );

  const gullies =
    Math.pow(
      Math.abs(
        fbm(
          warpedX * 14 - 11,
          warpedZ * 14 + 8,
          4
        ) - 0.5
      ) *
        2,
      1.6
    );

  let height =
    20 +
    168 *
      mainRidge *
      ridgeVariation +
    62 *
      secondaryRidge +
    34 *
      alpineNoise +
    12 *
      gullies;

  height -=
    26 *
    Math.exp(
      -Math.pow(
        (warpedZ - 0.03) / 0.09,
        2
      )
    ) *
    (
      0.35 +
      0.65 *
        fbm(
          warpedX * 5,
          warpedZ * 5,
          4
        )
    );

  return Math.max(
    0,
    height
  );
}


function limitGridSlopes(
  heights,
  resolution,
  sizeX,
  sizeZ,
  maximumSlopeDegrees = 45
) {
  const maxSlope =
    Math.tan(
      THREE.MathUtils.degToRad(
        maximumSlopeDegrees
      )
    );

  const maxXDifference =
    maxSlope *
    sizeX /
    (resolution - 1);

  const maxZDifference =
    maxSlope *
    sizeZ /
    (resolution - 1);

  for (
    let pass = 0;
    pass < 5;
    pass++
  ) {
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

        if (
          x < resolution - 1
        ) {
          const neighbourIndex =
            z * resolution + x + 1;

          if (
            heights[index] >
            heights[neighbourIndex] +
              maxXDifference
          ) {
            heights[index] =
              heights[neighbourIndex] +
              maxXDifference;
          }

          if (
            heights[neighbourIndex] >
            heights[index] +
              maxXDifference
          ) {
            heights[neighbourIndex] =
              heights[index] +
              maxXDifference;
          }
        }

        if (
          z < resolution - 1
        ) {
          const neighbourIndex =
            (z + 1) * resolution + x;

          if (
            heights[index] >
            heights[neighbourIndex] +
              maxZDifference
          ) {
            heights[index] =
              heights[neighbourIndex] +
              maxZDifference;
          }

          if (
            heights[neighbourIndex] >
            heights[index] +
              maxZDifference
          ) {
            heights[neighbourIndex] =
              heights[index] +
              maxZDifference;
          }
        }
      }
    }
  }
}


function buildTerrainGeometry(
  heights,
  resolution,
  sizeX,
  sizeZ
) {
  const vertexCount =
    resolution *
    resolution;

  const positions =
    new Float32Array(
      vertexCount * 3
    );

  for (
    let z = 0;
    z < resolution;
    z++
  ) {
    const nz =
      z / (resolution - 1);

    for (
      let x = 0;
      x < resolution;
      x++
    ) {
      const nx =
        x / (resolution - 1);

      const index =
        z * resolution + x;

      positions[index * 3] =
        (nx - 0.5) * sizeX;

      positions[index * 3 + 1] =
        heights[index];

      positions[index * 3 + 2] =
        (nz - 0.5) * sizeZ;
    }
  }

  const triangleCount =
    (resolution - 1) *
    (resolution - 1) *
    2;

  const indices =
    new Uint32Array(
      triangleCount * 3
    );

  let pointer = 0;

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

      const b =
        a + 1;

      const c =
        a + resolution;

      const d =
        c + 1;

      indices[pointer++] = a;
      indices[pointer++] = c;
      indices[pointer++] = b;

      indices[pointer++] = b;
      indices[pointer++] = c;
      indices[pointer++] = d;
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

  geometry.setIndex(
    new THREE.BufferAttribute(
      indices,
      1
    )
  );

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}


function buildTerrainNormalField(
  heights,
  resolution,
  sizeX,
  sizeZ
) {
  const vertexCount =
    resolution *
    resolution;

  const normalX =
    new Float32Array(
      vertexCount
    );

  const normalY =
    new Float32Array(
      vertexCount
    );

  const normalZ =
    new Float32Array(
      vertexCount
    );

  const gridStepX =
    sizeX /
    Math.max(
      resolution - 1,
      1
    );

  const gridStepZ =
    sizeZ /
    Math.max(
      resolution - 1,
      1
    );

  for (
    let z = 0;
    z < resolution;
    z++
  ) {
    const previousZ =
      Math.max(
        z - 1,
        0
      );

    const nextZ =
      Math.min(
        z + 1,
        resolution - 1
      );

    const actualStepZ =
      Math.max(
        (
          nextZ -
          previousZ
        ) *
          gridStepZ,
        0.000001
      );

    for (
      let x = 0;
      x < resolution;
      x++
    ) {
      const previousX =
        Math.max(
          x - 1,
          0
        );

      const nextX =
        Math.min(
          x + 1,
          resolution - 1
        );

      const actualStepX =
        Math.max(
          (
            nextX -
            previousX
          ) *
            gridStepX,
          0.000001
        );

      const index =
        z * resolution + x;

      const leftHeight =
        heights[
          z * resolution + previousX
        ];

      const rightHeight =
        heights[
          z * resolution + nextX
        ];

      const backHeight =
        heights[
          previousZ * resolution + x
        ];

      const forwardHeight =
        heights[
          nextZ * resolution + x
        ];

      const slopeX =
        (
          rightHeight -
          leftHeight
        ) /
        actualStepX;

      const slopeZ =
        (
          forwardHeight -
          backHeight
        ) /
        actualStepZ;

      let nx =
        -slopeX;

      let ny = 1;

      let nz =
        -slopeZ;

      const length =
        Math.hypot(
          nx,
          ny,
          nz
        ) || 1;

      nx /= length;
      ny /= length;
      nz /= length;

      normalX[index] = nx;
      normalY[index] = ny;
      normalZ[index] = nz;
    }
  }

  return {
    normalX,
    normalY,
    normalZ
  };
}


function setTerrain(
  heights,
  resolution,
  sizeX,
  sizeZ,
  sourceType
) {
  if (
    terrainMesh
  ) {
    scene.remove(
      terrainMesh
    );

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

  scene.add(
    terrainMesh
  );

  let minimum = Infinity;
  let maximum = -Infinity;

  for (
    const height of heights
  ) {
    minimum =
      Math.min(
        minimum,
        height
      );

    maximum =
      Math.max(
        maximum,
        height
      );
  }

  const normalField =
    buildTerrainNormalField(
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
    minimum,
    maximum,
    sourceType,

    normalX:
      normalField.normalX,

    normalY:
      normalField.normalY,

    normalZ:
      normalField.normalZ,

    pendingHeightDelta:
      new Float32Array(
        resolution * resolution
      ),

    pendingTouched: [],

    pendingTouchedFlags:
      new Uint8Array(
        resolution * resolution
      ),

    evolutionAccumulator: 0
  };

  fitCameraToTerrain();
  updateSourceVisuals();
}


function buildProceduralTerrain() {
  const resolution =
    clamp(
      Math.round(
        params.terrainResolution
      ),
      64,
      768
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

  for (
    let z = 0;
    z < resolution;
    z++
  ) {
    const nz =
      z / (resolution - 1);

    const worldZ =
      (nz - 0.5) *
      sizeZ;

    for (
      let x = 0;
      x < resolution;
      x++
    ) {
      const nx =
        x / (resolution - 1);

      const worldX =
        (nx - 0.5) *
        sizeX;

      const index =
        z * resolution + x;

      heights[index] =
        alpineHeight(
          worldX,
          worldZ,
          sizeX,
          sizeZ
        ) *
        params.verticalExaggeration;
    }
  }

  limitGridSlopes(
    heights,
    resolution,
    sizeX,
    sizeZ,
    45
  );

  setTerrain(
    heights,
    resolution,
    sizeX,
    sizeZ,
    "procedural"
  );
}


function extractPointsFromObject(object) {
  const points = [];

  object.updateMatrixWorld(
    true
  );

  object.traverse(
    (child) => {
      if (
        !child.isMesh ||
        !child.geometry
      ) {
        return;
      }

      const position =
        child.geometry.getAttribute(
          "position"
        );

      if (
        !position
      ) {
        return;
      }

      const vertex =
        new THREE.Vector3();

      for (
        let i = 0;
        i < position.count;
        i++
      ) {
        vertex.fromBufferAttribute(
          position,
          i
        );

        vertex.applyMatrix4(
          child.matrixWorld
        );

        points.push(
          vertex.clone()
        );
      }
    }
  );

  return points;
}


function buildImportedTerrain() {
  if (
    !importedRawPoints ||
    importedRawPoints.length < 3
  ) {
    buildProceduralTerrain();
    return;
  }

  const resolution =
    clamp(
      Math.round(
        params.terrainResolution
      ),
      64,
      768
    );

  const rotation =
    new THREE.Euler(
      THREE.MathUtils.degToRad(
        DEFAULT_IMPORTED_ROTATION_X +
        params.rotationX
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
    importedRawPoints.map(
      (point) => {
        return point
          .clone()
          .applyEuler(
            rotation
          );
      }
    );

  const bounds =
    new THREE.Box3()
      .setFromPoints(
        transformed
      );

  const rawSize =
    bounds.getSize(
      new THREE.Vector3()
    );

  const spanX =
    Math.max(
      rawSize.x,
      0.0001
    );

  const spanZ =
    Math.max(
      rawSize.z,
      0.0001
    );

  const sizeX =
    TERRAIN_SIZE *
    params.modelScale;

  const sizeZ =
    TERRAIN_SIZE *
    params.modelScale *
    params.depthScale;

  const sampled =
    new Float32Array(
      resolution * resolution
    );

  sampled.fill(
    NaN
  );

  for (
    const point of transformed
  ) {
    const nx =
      clamp(
        (
          point.x -
          bounds.min.x
        ) /
          spanX,
        0,
        1
      );

    const nz =
      clamp(
        (
          point.z -
          bounds.min.z
        ) /
          spanZ,
        0,
        1
      );

    const x =
      Math.round(
        nx *
        (resolution - 1)
      );

    const z =
      Math.round(
        nz *
        (resolution - 1)
      );

    const index =
      z * resolution + x;

    if (
      !Number.isFinite(
        sampled[index]
      ) ||
      point.y >
        sampled[index]
    ) {
      sampled[index] =
        point.y;
    }
  }

  let minimumY = Infinity;

  for (
    const value of sampled
  ) {
    if (
      Number.isFinite(value)
    ) {
      minimumY =
        Math.min(
          minimumY,
          value
        );
    }
  }

  if (
    !Number.isFinite(
      minimumY
    )
  ) {
    minimumY =
      bounds.min.y;
  }

  for (
    let pass = 0;
    pass < 10;
    pass++
  ) {
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

        if (
          Number.isFinite(
            sampled[index]
          )
        ) {
          continue;
        }

        let total = 0;
        let count = 0;

        for (
          let dz = -1;
          dz <= 1;
          dz++
        ) {
          for (
            let dx = -1;
            dx <= 1;
            dx++
          ) {
            const nx =
              x + dx;

            const nz =
              z + dz;

            if (
              nx < 0 ||
              nx >= resolution ||
              nz < 0 ||
              nz >= resolution
            ) {
              continue;
            }

            const neighbour =
              sampled[
                nz * resolution + nx
              ];

            if (
              Number.isFinite(
                neighbour
              )
            ) {
              total += neighbour;
              count++;
            }
          }
        }

        if (
          count > 0
        ) {
          sampled[index] =
            total / count;
        }
      }
    }
  }

  for (
    let i = 0;
    i < sampled.length;
    i++
  ) {
    if (
      !Number.isFinite(
        sampled[i]
      )
    ) {
      sampled[i] =
        minimumY;
    }

    sampled[i] =
      (
        sampled[i] -
        minimumY
      ) *
      params.metersPerModelUnit *
      params.verticalExaggeration *
      params.modelScale;
  }

  setTerrain(
    sampled,
    resolution,
    sizeX,
    sizeZ,
    "imported"
  );
}


function buildCurrentTerrain() {
  if (
    importedRawPoints
  ) {
    buildImportedTerrain();
  } else {
    buildProceduralTerrain();
  }
}


function fitCameraToTerrain() {
  if (
    !terrainMesh ||
    !terrainMesh.geometry.boundingBox
  ) {
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

  const maximumDimension =
    Math.max(
      size.x,
      size.y,
      size.z
    );

  camera.near =
    Math.max(
      0.1,
      maximumDimension / 10000
    );

  camera.far =
    Math.max(
      10000,
      maximumDimension * 20
    );

  camera.updateProjectionMatrix();

  camera.position.set(
    center.x +
      maximumDimension * 0.72,

    center.y +
      maximumDimension * 0.62,

    center.z +
      maximumDimension * 0.72
  );

  controls.target.copy(
    center
  );

  controls.target.y +=
    maximumDimension * 0.08;

  controls.update();
}


function terrainGridCoordinates(x, z) {
  if (
    !terrainState
  ) {
    return null;
  }

  const {
    resolution,
    sizeX,
    sizeZ
  } = terrainState;

  const normalizedX =
    clamp(
      x / sizeX + 0.5,
      0,
      1
    );

  const normalizedZ =
    clamp(
      z / sizeZ + 0.5,
      0,
      1
    );

  const gridX =
    normalizedX *
    (resolution - 1);

  const gridZ =
    normalizedZ *
    (resolution - 1);

  const x0 =
    Math.floor(gridX);

  const z0 =
    Math.floor(gridZ);

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
    z0,
    x1,
    z1,
    tx: gridX - x0,
    tz: gridZ - z0
  };
}


function terrainHeightAt(x, z) {
  if (
    !terrainState
  ) {
    return 0;
  }

  const {
    heights,
    resolution
  } = terrainState;

  const coordinates =
    terrainGridCoordinates(
      x,
      z
    );

  const {
    x0,
    z0,
    x1,
    z1,
    tx,
    tz
  } = coordinates;

  const h00 =
    heights[
      z0 * resolution + x0
    ];

  const h10 =
    heights[
      z0 * resolution + x1
    ];

  const h01 =
    heights[
      z1 * resolution + x0
    ];

  const h11 =
    heights[
      z1 * resolution + x1
    ];

  const h0 =
    THREE.MathUtils.lerp(
      h00,
      h10,
      tx
    );

  const h1 =
    THREE.MathUtils.lerp(
      h01,
      h11,
      tx
    );

  return THREE.MathUtils.lerp(
    h0,
    h1,
    tz
  );
}


function terrainNormalAt(x, z) {
  if (
    !terrainState ||
    !terrainState.normalX
  ) {
    return terrainNormalScratch.set(
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

  const coordinates =
    terrainGridCoordinates(
      x,
      z
    );

  const {
    x0,
    z0,
    x1,
    z1,
    tx,
    tz
  } = coordinates;

  const index00 =
    z0 * resolution + x0;

  const index10 =
    z0 * resolution + x1;

  const index01 =
    z1 * resolution + x0;

  const index11 =
    z1 * resolution + x1;

  const interpolate =
    (array) => {
      const a =
        THREE.MathUtils.lerp(
          array[index00],
          array[index10],
          tx
        );

      const b =
        THREE.MathUtils.lerp(
          array[index01],
          array[index11],
          tx
        );

      return THREE.MathUtils.lerp(
        a,
        b,
        tz
      );
    };

  const nx =
    interpolate(normalX);

  const ny =
    interpolate(normalY);

  const nz =
    interpolate(normalZ);

  const length =
    Math.hypot(
      nx,
      ny,
      nz
    ) || 1;

  return terrainNormalScratch.set(
    nx / length,
    ny / length,
    nz / length
  );
}


function refreshTerrainAfterHeightChange(
  updateSource = true
) {
  if (
    !terrainState ||
    !terrainMesh
  ) {
    return;
  }

  const {
    heights,
    resolution,
    sizeX,
    sizeZ
  } = terrainState;

  const positionAttribute =
    terrainMesh.geometry.getAttribute(
      "position"
    );

  const positions =
    positionAttribute.array;

  for (
    let i = 0;
    i < heights.length;
    i++
  ) {
    positions[i * 3 + 1] =
      heights[i];
  }

  positionAttribute.needsUpdate =
    true;

  terrainMesh.geometry.computeVertexNormals();
  terrainMesh.geometry.computeBoundingBox();
  terrainMesh.geometry.computeBoundingSphere();

  const normalField =
    buildTerrainNormalField(
      heights,
      resolution,
      sizeX,
      sizeZ
    );

  terrainState.normalX =
    normalField.normalX;

  terrainState.normalY =
    normalField.normalY;

  terrainState.normalZ =
    normalField.normalZ;

  let minimum = Infinity;
  let maximum = -Infinity;

  for (
    const height of heights
  ) {
    minimum =
      Math.min(
        minimum,
        height
      );

    maximum =
      Math.max(
        maximum,
        height
      );
  }

  terrainState.minimum =
    minimum;

  terrainState.maximum =
    maximum;

  if (
    updateSource
  ) {
    updateSourceVisuals();
  }
}


/* ------------------------------------------------------------------------- */
/* Polygon geometry                                                          */
/* ------------------------------------------------------------------------- */

function signedPolygonArea(points) {
  let area = 0;

  for (
    let i = 0;
    i < points.length;
    i++
  ) {
    const a =
      points[i];

    const b =
      points[
        (i + 1) %
        points.length
      ];

    area +=
      a.x * b.y -
      b.x * a.y;
  }

  return area * 0.5;
}


function absolutePolygonArea(points) {
  return Math.abs(
    signedPolygonArea(
      points
    )
  );
}


function polygonCentroid(points) {
  const signedArea =
    signedPolygonArea(
      points
    );

  if (
    Math.abs(signedArea) <
    0.000001
  ) {
    const average =
      new THREE.Vector2();

    for (
      const point of points
    ) {
      average.add(
        point
      );
    }

    return average.multiplyScalar(
      1 / points.length
    );
  }

  const centroid =
    new THREE.Vector2();

  for (
    let i = 0;
    i < points.length;
    i++
  ) {
    const a =
      points[i];

    const b =
      points[
        (i + 1) %
        points.length
      ];

    const factor =
      a.x * b.y -
      b.x * a.y;

    centroid.x +=
      (a.x + b.x) *
      factor;

    centroid.y +=
      (a.y + b.y) *
      factor;
  }

  return centroid.multiplyScalar(
    1 /
    (
      6 *
      signedArea
    )
  );
}


function pointInPolygon(point, polygon) {
  let inside = false;

  for (
    let i = 0,
    j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {
    const a =
      polygon[i];

    const b =
      polygon[j];

    const intersects =
      (a.y > point.y) !==
        (b.y > point.y) &&
      point.x <
        (
          (b.x - a.x) *
            (point.y - a.y)
        ) /
          (b.y - a.y) +
          a.x;

    if (
      intersects
    ) {
      inside = !inside;
    }
  }

  return inside;
}


function orientation(a, b, c) {
  const value =
    (b.y - a.y) *
      (c.x - b.x) -
    (b.x - a.x) *
      (c.y - b.y);

  if (
    Math.abs(value) <
    0.000001
  ) {
    return 0;
  }

  return value > 0 ? 1 : 2;
}


function onSegment(a, b, c) {
  return (
    b.x <=
      Math.max(a.x, c.x) +
        0.000001 &&
    b.x >=
      Math.min(a.x, c.x) -
        0.000001 &&
    b.y <=
      Math.max(a.y, c.y) +
        0.000001 &&
    b.y >=
      Math.min(a.y, c.y) -
        0.000001
  );
}


function segmentsIntersect(
  p1,
  q1,
  p2,
  q2
) {
  const o1 =
    orientation(
      p1,
      q1,
      p2
    );

  const o2 =
    orientation(
      p1,
      q1,
      q2
    );

  const o3 =
    orientation(
      p2,
      q2,
      p1
    );

  const o4 =
    orientation(
      p2,
      q2,
      q1
    );

  if (
    o1 !== o2 &&
    o3 !== o4
  ) {
    return true;
  }

  if (
    o1 === 0 &&
    onSegment(
      p1,
      p2,
      q1
    )
  ) {
    return true;
  }

  if (
    o2 === 0 &&
    onSegment(
      p1,
      q2,
      q1
    )
  ) {
    return true;
  }

  if (
    o3 === 0 &&
    onSegment(
      p2,
      p1,
      q2
    )
  ) {
    return true;
  }

  if (
    o4 === 0 &&
    onSegment(
      p2,
      q1,
      q2
    )
  ) {
    return true;
  }

  return false;
}


function polygonSelfIntersects(points) {
  const count =
    points.length;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const a1 =
      points[i];

    const a2 =
      points[
        (i + 1) %
        count
      ];

    for (
      let j = i + 1;
      j < count;
      j++
    ) {
      const b1 =
        points[j];

      const b2 =
        points[
          (j + 1) %
          count
        ];

      const adjacent =
        i === j ||
        (i + 1) % count === j ||
        (j + 1) % count === i;

      if (
        adjacent
      ) {
        continue;
      }

      if (
        segmentsIntersect(
          a1,
          a2,
          b1,
          b2
        )
      ) {
        return true;
      }
    }
  }

  return false;
}


function getSourcePolygonWorld() {
  if (
    source.customPolygonLocal &&
    source.customPolygonLocal.length >= 3
  ) {
    return source.customPolygonLocal.map(
      (point) => {
        return new THREE.Vector2(
          source.center.x + point.x,
          source.center.y + point.y
        );
      }
    );
  }

  const side =
    Math.sqrt(
      Math.max(
        params.sourceArea,
        0.01
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


function getSourceArea() {
  if (
    source.customPolygonLocal &&
    source.customPolygonLocal.length >= 3
  ) {
    return source.customArea;
  }

  return Math.max(
    params.sourceArea,
    0.01
  );
}


function getNominalSourceHeight() {
  return (
    params.sourceVolume /
    Math.max(
      getSourceArea(),
      0.01
    )
  );
}


function getSourceDisplayHeight() {
  const nominalHeight =
    getNominalSourceHeight();

  const initialStackHeight =
    particles?.initialStackHeight || 0;

  return Math.max(
    nominalHeight,
    initialStackHeight
  );
}


function createLineObject(
  points,
  material,
  loop = false
) {
  const vertices =
    points.map(
      (point) => {
        return new THREE.Vector3(
          point.x,
          point.y,
          point.z
        );
      }
    );

  if (
    loop &&
    vertices.length > 0
  ) {
    vertices.push(
      vertices[0].clone()
    );
  }

  const geometry =
    new THREE.BufferGeometry()
      .setFromPoints(
        vertices
      );

  return new THREE.Line(
    geometry,
    material
  );
}


function updateSourceVisuals() {
  const polygon =
    getSourcePolygonWorld();

  if (
    polygon.length < 3 ||
    !terrainState
  ) {
    return;
  }

  if (
    sourceOutline
  ) {
    sourceGroup.remove(
      sourceOutline
    );

    sourceOutline.geometry.dispose();
    sourceOutline.material.dispose();
  }

  const outlinePoints =
    polygon.map(
      (point) => {
        return new THREE.Vector3(
          point.x,
          terrainHeightAt(
            point.x,
            point.y
          ) + 0.12,
          point.y
        );
      }
    );

  sourceOutline =
    createLineObject(
      outlinePoints,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      }),
      true
    );

  sourceGroup.add(
    sourceOutline
  );


  if (
    sourceVolumeWire
  ) {
    sourceGroup.remove(
      sourceVolumeWire
    );

    sourceVolumeWire.geometry.dispose();
    sourceVolumeWire.material.dispose();
  }

  const displayHeight =
    getSourceDisplayHeight();

  const segmentVertices = [];

  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    const current =
      polygon[i];

    const next =
      polygon[
        (i + 1) %
        polygon.length
      ];

    const currentBase =
      terrainHeightAt(
        current.x,
        current.y
      ) + 0.06;

    const nextBase =
      terrainHeightAt(
        next.x,
        next.y
      ) + 0.06;

    const currentBottom =
      new THREE.Vector3(
        current.x,
        currentBase,
        current.y
      );

    const nextBottom =
      new THREE.Vector3(
        next.x,
        nextBase,
        next.y
      );

    const currentTop =
      new THREE.Vector3(
        current.x,
        currentBase +
          displayHeight,
        current.y
      );

    const nextTop =
      new THREE.Vector3(
        next.x,
        nextBase +
          displayHeight,
        next.y
      );

    segmentVertices.push(
      currentBottom,
      nextBottom,
      currentTop,
      nextTop,
      currentBottom,
      currentTop
    );
  }

  const volumeGeometry =
    new THREE.BufferGeometry()
      .setFromPoints(
        segmentVertices
      );

  sourceVolumeWire =
    new THREE.LineSegments(
      volumeGeometry,
      new THREE.LineBasicMaterial({
        color: 0x9eaca5,
        transparent: true,
        opacity: 0.42
      })
    );

  sourceGroup.add(
    sourceVolumeWire
  );

  if (
    source.customPolygonLocal
  ) {
    ui.releaseAreaReadout.textContent =
      `CUSTOM AREA: ${formatNumber(
        source.customArea
      )} m²`;
  }

  sourceGroup.visible =
    !simulation.started;
}


function updateDraftLine() {
  if (
    draftLine
  ) {
    sourceGroup.remove(
      draftLine
    );

    draftLine.geometry.dispose();
    draftLine.material.dispose();

    draftLine = null;
  }

  if (
    source.draftWorld.length === 0
  ) {
    return;
  }

  const points =
    source.draftWorld.map(
      (point) => {
        return new THREE.Vector3(
          point.x,
          terrainHeightAt(
            point.x,
            point.y
          ) + 0.25,
          point.y
        );
      }
    );

  draftLine =
    createLineObject(
      points,
      new THREE.LineBasicMaterial({
        color: 0xe5b278
      })
    );

  sourceGroup.add(
    draftLine
  );
}


function clearCustomShape() {
  source.customPolygonLocal = null;
  source.customArea = 0;
  source.draftWorld = [];
  source.drawing = false;

  updateDraftLine();
  updateSourceVisuals();

  ui.releaseAreaReadout.textContent =
    "NO CUSTOM SHAPE";

  setStatus(
    "CUSTOM SHAPE CLEARED"
  );

  requestParticleReset();
}


function finishCustomShape() {
  const points =
    source.draftWorld;

  if (
    points.length < 3
  ) {
    source.drawing = false;

    setStatus(
      "ADD AT LEAST 3 POINTS"
    );

    return;
  }

  if (
    polygonSelfIntersects(
      points
    )
  ) {
    source.drawing = false;

    setStatus(
      "SHAPE LINES MAY NOT CROSS"
    );

    return;
  }

  const area =
    absolutePolygonArea(
      points
    );

  if (
    area < 1
  ) {
    source.drawing = false;

    setStatus(
      "CUSTOM SHAPE IS TOO SMALL"
    );

    return;
  }

  const centroid =
    polygonCentroid(
      points
    );

  source.center.copy(
    centroid
  );

  source.customPolygonLocal =
    points.map(
      (point) => {
        return new THREE.Vector2(
          point.x - centroid.x,
          point.y - centroid.y
        );
      }
    );

  source.customArea =
    area;

  source.draftWorld = [];
  source.drawing = false;

  updateDraftLine();
  updateSourceVisuals();

  ui.releaseAreaReadout.textContent =
    `CUSTOM AREA: ${formatNumber(
      area
    )} m²`;

  setStatus(
    "CUSTOM SHAPE READY"
  );

  requestParticleReset();
}


function addDraftPoint(point) {
  if (
    source.draftWorld.length > 0
  ) {
    const previous =
      source.draftWorld[
        source.draftWorld.length - 1
      ];

    if (
      previous.distanceTo(
        point
      ) < 0.5
    ) {
      return;
    }
  }

  source.draftWorld.push(
    point
  );

  updateDraftLine();

  setStatus(
    "DRAWING RELEASE SHAPE"
  );
}


/* ------------------------------------------------------------------------- */
/* Particles                                                                 */
/* ------------------------------------------------------------------------- */

function getPolygonBounds(polygon) {
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;

  for (
    const point of polygon
  ) {
    minX =
      Math.min(
        minX,
        point.x
      );

    minZ =
      Math.min(
        minZ,
        point.y
      );

    maxX =
      Math.max(
        maxX,
        point.x
      );

    maxZ =
      Math.max(
        maxZ,
        point.y
      );
  }

  return {
    minX,
    minZ,
    maxX,
    maxZ
  };
}


function buildInitialBasePositions(
  polygon,
  count,
  radius
) {
  const bounds =
    getPolygonBounds(
      polygon
    );

  const area =
    Math.max(
      absolutePolygonArea(
        polygon
      ),
      0.01
    );

  const areaBasedSpacing =
    Math.sqrt(
      area /
      Math.max(
        count,
        1
      )
    ) *
    0.92;

  const particleBasedSpacing =
    radius *
    INITIAL_PARTICLE_HORIZONTAL_SPACING;

  const spacing =
    Math.max(
      areaBasedSpacing,
      particleBasedSpacing,
      0.01
    );

  const candidates = [];

  let row = 0;

  for (
    let z =
      bounds.minZ +
      spacing * 0.5;

    z <= bounds.maxZ;

    z += spacing
  ) {
    const offset =
      row % 2 === 1
        ? spacing * 0.5
        : 0;

    for (
      let x =
        bounds.minX +
        spacing * 0.5 +
        offset;

      x <= bounds.maxX;

      x += spacing
    ) {
      const point =
        new THREE.Vector2(
          x,
          z
        );

      if (
        pointInPolygon(
          point,
          polygon
        )
      ) {
        candidates.push(
          point
        );
      }
    }

    row++;
  }

  if (
    candidates.length === 0
  ) {
    candidates.push(
      polygonCentroid(
        polygon
      )
    );
  }

  if (
    candidates.length <= count
  ) {
    return candidates;
  }

  const selected = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const index =
      Math.min(
        candidates.length - 1,
        Math.floor(
          (
            i + 0.5
          ) *
          candidates.length /
          count
        )
      );

    selected.push(
      candidates[index]
    );
  }

  return selected;
}


function getStartDirection(x, z) {
  const mode =
    params.startDirectionMode;

  let dx = 0;
  let dz = 1;

  if (
    mode === "downhill"
  ) {
    const normal =
      terrainNormalAt(
        x,
        z
      );

    dx =
      -normal.x;

    dz =
      -normal.z;
  }

  if (
    mode === "fixed"
  ) {
    const angle =
      THREE.MathUtils.degToRad(
        params.directionAngle
      );

    dx =
      Math.sin(
        angle
      );

    dz =
      Math.cos(
        angle
      );
  }

  if (
    mode === "radial"
  ) {
    dx =
      x -
      source.center.x;

    dz =
      z -
      source.center.y;

    if (
      Math.hypot(
        dx,
        dz
      ) < 0.001
    ) {
      const normal =
        terrainNormalAt(
          x,
          z
        );

      dx =
        -normal.x;

      dz =
        -normal.z;
    }
  }

  if (
    mode === "vector"
  ) {
    dx =
      params.directionX;

    dz =
      params.directionZ;
  }

  const length =
    Math.hypot(
      dx,
      dz
    );

  if (
    length < 0.000001
  ) {
    return new THREE.Vector3(
      0,
      0,
      1
    );
  }

  return new THREE.Vector3(
    dx / length,
    0,
    dz / length
  );
}


function generateParticles() {
  const requested =
    requestedParticleCount();

  const count =
    Math.min(
      requested,
      MAX_SIMULATED_PARTICLES
    );

  const safeVolume =
    clamp(
      params.sourceVolume,
      MIN_SOURCE_VOLUME,
      MAX_SOURCE_VOLUME
    );

  const parcelVolume =
    safeVolume /
    count;

  const physicalRadius =
    Math.cbrt(
      parcelVolume * 3 /
      (4 * Math.PI)
    );

  const physicalDiameter =
    physicalRadius * 2;

  const verticalSpacing =
    Math.max(
      physicalDiameter *
        INITIAL_PARTICLE_VERTICAL_SPACING,
      0.01
    );

  const positions =
    new Float32Array(
      count * 3
    );

  const velocities =
    new Float32Array(
      count * 3
    );

  const distanceTraveled =
    new Float32Array(
      count
    );

  const settledDuration =
    new Float32Array(
      count
    );

  const depositionRemaining =
    new Float32Array(
      count
    );

  depositionRemaining.fill(
    1
  );

  const lastPositions =
    new Float32Array(
      count * 3
    );

  const polygon =
    getSourcePolygonWorld();

  const basePositions =
    buildInitialBasePositions(
      polygon,
      count,
      physicalRadius
    );

  const layerCount =
    Math.ceil(
      count /
      basePositions.length
    );

  const initialStackHeight =
    physicalDiameter +
    (
      Math.max(
        layerCount - 1,
        0
      ) *
      verticalSpacing
    ) +
    SURFACE_CLEARANCE * 2;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const base =
      basePositions[
        i % basePositions.length
      ];

    const layer =
      Math.floor(
        i /
        basePositions.length
      );

    const x =
      base.x;

    const z =
      base.y;

    const terrainY =
      terrainHeightAt(
        x,
        z
      );

    const y =
      terrainY +
      physicalRadius +
      SURFACE_CLEARANCE +
      layer *
        verticalSpacing;

    const index =
      i * 3;

    positions[index] =
      x;

    positions[index + 1] =
      y;

    positions[index + 2] =
      z;

    const direction =
      getStartDirection(
        x,
        z
      );

    velocities[index] =
      direction.x *
      params.startVelocity;

    velocities[index + 1] =
      0;

    velocities[index + 2] =
      direction.z *
      params.startVelocity;

    lastPositions[index] =
      x;

    lastPositions[index + 1] =
      y;

    lastPositions[index + 2] =
      z;
  }

  particles = {
    count,
    positions,
    velocities,
    distanceTraveled,
    settledDuration,
    depositionRemaining,
    lastPositions,

    parcelVolume,
    radius: physicalRadius,

    layerCount,
    initialStackHeight
  };

  updateParticleReadout();
}


/* ------------------------------------------------------------------------- */
/* Particle rendering                                                        */
/* ------------------------------------------------------------------------- */

function particleVertexShader() {
  return `
    attribute vec3 color;

    varying vec3 vColor;

    uniform float uSize;

    void main() {
      vColor = color;

      vec4 mvPosition =
        modelViewMatrix * vec4(position, 1.0);

      gl_PointSize = clamp(
        uSize * (900.0 / max(1.0, -mvPosition.z)),
        2.0,
        80.0
      );

      gl_Position =
        projectionMatrix * mvPosition;
    }
  `;
}


function particleFragmentShader() {
  return `
    varying vec3 vColor;

    void main() {
      vec2 pointCoordinate =
        gl_PointCoord - vec2(0.5);

      float distanceFromCentre =
        length(pointCoordinate);

      if (distanceFromCentre > 0.5) {
        discard;
      }

      float edge =
        smoothstep(
          0.5,
          0.35,
          distanceFromCentre
        );

      gl_FragColor =
        vec4(
          vColor,
          edge * 0.96
        );
    }
  `;
}


function createParticleVisual() {
  if (
    particlePoints
  ) {
    scene.remove(
      particlePoints
    );

    particleGeometry.dispose();
    particleMaterial.dispose();

    particlePoints = null;
    particleGeometry = null;
    particleMaterial = null;
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
      vertexShader:
        particleVertexShader(),

      fragmentShader:
        particleFragmentShader(),

      uniforms: {
        uSize: {
          value: clamp(
            particles.radius *
              2 *
              params.particleSize,
            0.15,
            8
          )
        }
      },

      transparent: true,
      depthTest: true,
      depthWrite: false
    });

  particlePoints =
    new THREE.Points(
      particleGeometry,
      particleMaterial
    );

  particlePoints.frustumCulled =
    false;

  scene.add(
    particlePoints
  );
}


function makoColor(value, target) {
  const t =
    clamp(
      value,
      0,
      1
    );

  const scaled =
    t *
    (
      MAKO_COLORS.length - 1
    );

  const index =
    Math.min(
      MAKO_COLORS.length - 2,
      Math.floor(
        scaled
      )
    );

  const fraction =
    scaled -
    index;

  target.copy(
    MAKO_COLORS[index]
  ).lerp(
    MAKO_COLORS[index + 1],
    fraction
  );
}


function updateParticleColors() {
  if (
    !particles ||
    !particleGeometry
  ) {
    return;
  }

  const colorAttribute =
    particleGeometry.getAttribute(
      "color"
    );

  const colors =
    colorAttribute.array;

  const count =
    particles.count;

  let maximumSpeed = 0;
  let maximumDistance = 0;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const index =
      i * 3;

    const vx =
      particles.velocities[index];

    const vy =
      particles.velocities[index + 1];

    const vz =
      particles.velocities[index + 2];

    maximumSpeed =
      Math.max(
        maximumSpeed,
        Math.hypot(
          vx,
          vy,
          vz
        )
      );

    maximumDistance =
      Math.max(
        maximumDistance,
        particles.distanceTraveled[i]
      );
  }

  let thicknessCell = 0;
  let thicknessMap = null;
  let maximumThickness = 0;

  if (
    params.colorMode ===
    "thickness"
  ) {
    thicknessCell =
      Math.max(
        5,
        particles.radius * 4
      );

    thicknessMap =
      new Map();

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const index =
        i * 3;

      const x =
        particles.positions[index];

      const z =
        particles.positions[index + 2];

      const key =
        `${Math.floor(x / thicknessCell)}:` +
        `${Math.floor(z / thicknessCell)}`;

      thicknessMap.set(
        key,
        (
          thicknessMap.get(key) || 0
        ) +
        particles.parcelVolume
      );
    }

    for (
      const volume of thicknessMap.values()
    ) {
      const thickness =
        volume /
        (
          thicknessCell *
          thicknessCell
        );

      maximumThickness =
        Math.max(
          maximumThickness,
          thickness
        );
    }
  }

  const temporaryColor =
    new THREE.Color();

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const index =
      i * 3;

    let value = 0;

    if (
      params.colorMode ===
      "distance"
    ) {
      value =
        maximumDistance > 0
          ? particles.distanceTraveled[i] /
            maximumDistance
          : 0;
    } else if (
      params.colorMode ===
      "thickness"
    ) {
      const x =
        particles.positions[index];

      const z =
        particles.positions[index + 2];

      const key =
        `${Math.floor(x / thicknessCell)}:` +
        `${Math.floor(z / thicknessCell)}`;

      const volume =
        thicknessMap.get(key) || 0;

      const thickness =
        volume /
        (
          thicknessCell *
          thicknessCell
        );

      value =
        maximumThickness > 0
          ? thickness /
            maximumThickness
          : 0;
    } else {
      const vx =
        particles.velocities[index];

      const vy =
        particles.velocities[index + 1];

      const vz =
        particles.velocities[index + 2];

      value =
        maximumSpeed > 0
          ? Math.hypot(
              vx,
              vy,
              vz
            ) /
            maximumSpeed
          : 0.15;
    }

    makoColor(
      value,
      temporaryColor
    );

    colors[index] =
      temporaryColor.r;

    colors[index + 1] =
      temporaryColor.g;

    colors[index + 2] =
      temporaryColor.b;
  }

  colorAttribute.needsUpdate =
    true;

  if (
    particleMaterial
  ) {
    particleMaterial.uniforms.uSize.value =
      clamp(
        particles.radius *
          2 *
          params.particleSize,
        0.15,
        8
      );
  }
}


function syncPointParticles() {
  if (
    !particleGeometry
  ) {
    return;
  }

  particleGeometry.getAttribute(
    "position"
  ).needsUpdate =
    true;
}


/* ------------------------------------------------------------------------- */
/* Physics                                                                   */
/* ------------------------------------------------------------------------- */

function spatialKey(x, y, z) {
  return `${x}|${y}|${z}`;
}


function buildSpatialHash(cellSize) {
  const hash =
    new Map();

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const index =
      i * 3;

    const x =
      particles.positions[index];

    const y =
      particles.positions[index + 1];

    const z =
      particles.positions[index + 2];

    const key =
      spatialKey(
        Math.floor(
          x / cellSize
        ),
        Math.floor(
          y / cellSize
        ),
        Math.floor(
          z / cellSize
        )
      );

    let bucket =
      hash.get(
        key
      );

    if (
      !bucket
    ) {
      bucket = [];

      hash.set(
        key,
        bucket
      );
    }

    bucket.push(
      i
    );
  }

  return hash;
}


function particleSurfaceHeight(x, z) {
  return (
    terrainHeightAt(
      x,
      z
    ) +
    particles.radius +
    SURFACE_CLEARANCE
  );
}


function particleIsNearTerrain(
  x,
  y,
  z
) {
  return (
    y <=
    particleSurfaceHeight(
      x,
      z
    ) +
    SURFACE_CONTACT_TOLERANCE
  );
}


function applyCohesion(deltaTime) {
  if (
    !particles ||
    params.particleCohesion <= 0
  ) {
    return;
  }

  const range =
    Math.max(
      particles.radius *
        2 *
        COHESION_RANGE_MULTIPLIER,
      0.1
    );

  const restDistance =
    clamp(
      particles.radius *
        params.cohesionRestDistanceFactor,
      particles.radius * 2,
      range * 0.95
    );

  const attractionRange =
    Math.max(
      range -
        restDistance,
      0.001
    );

  const hash =
    buildSpatialHash(
      range
    );

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const index =
      i * 3;

    const ix =
      Math.floor(
        particles.positions[index] /
          range
      );

    const iy =
      Math.floor(
        particles.positions[index + 1] /
          range
      );

    const iz =
      Math.floor(
        particles.positions[index + 2] /
          range
      );

    let neighbourCount = 0;

    for (
      let dx = -1;
      dx <= 1;
      dx++
    ) {
      for (
        let dy = -1;
        dy <= 1;
        dy++
      ) {
        for (
          let dz = -1;
          dz <= 1;
          dz++
        ) {
          const bucket =
            hash.get(
              spatialKey(
                ix + dx,
                iy + dy,
                iz + dz
              )
            );

          if (
            !bucket
          ) {
            continue;
          }

          for (
            const j of bucket
          ) {
            if (
              j <= i
            ) {
              continue;
            }

            const jIndex =
              j * 3;

            const dxp =
              particles.positions[jIndex] -
              particles.positions[index];

            const dyp =
              particles.positions[jIndex + 1] -
              particles.positions[index + 1];

            const dzp =
              particles.positions[jIndex + 2] -
              particles.positions[index + 2];

            const distance =
              Math.hypot(
                dxp,
                dyp,
                dzp
              );

            if (
              distance <= restDistance ||
              distance >= range ||
              distance <= 0.000001
            ) {
              continue;
            }

            const stretch =
              (
                distance -
                restDistance
              ) /
              attractionRange;

            const strength =
              params.particleCohesion *
              COHESION_STRENGTH *
              stretch;

            const impulse =
              strength *
              deltaTime;

            const nx =
              dxp / distance;

            const ny =
              dyp / distance;

            const nz =
              dzp / distance;

            particles.velocities[index] +=
              nx *
              impulse;

            particles.velocities[index + 1] +=
              ny *
              impulse;

            particles.velocities[index + 2] +=
              nz *
              impulse;

            particles.velocities[jIndex] -=
              nx *
              impulse;

            particles.velocities[jIndex + 1] -=
              ny *
              impulse;

            particles.velocities[jIndex + 2] -=
              nz *
              impulse;

            neighbourCount++;

            if (
              neighbourCount >=
              MAX_COHESION_NEIGHBOURS
            ) {
              break;
            }
          }

          if (
            neighbourCount >=
            MAX_COHESION_NEIGHBOURS
          ) {
            break;
          }
        }

        if (
          neighbourCount >=
          MAX_COHESION_NEIGHBOURS
        ) {
          break;
        }
      }

      if (
        neighbourCount >=
        MAX_COHESION_NEIGHBOURS
      ) {
        break;
      }
    }
  }
}


function applyForcesAndIntegrate(
  deltaTime
) {
  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const index =
      i * 3;

    let x =
      particles.positions[index];

    let y =
      particles.positions[index + 1];

    let z =
      particles.positions[index + 2];

    let vx =
      particles.velocities[index];

    let vy =
      particles.velocities[index + 1];

    let vz =
      particles.velocities[index + 2];

    const nearTerrain =
      particleIsNearTerrain(
        x,
        y,
        z
      );

    let nx = 0;
    let ny = 1;
    let nz = 0;

    if (
      nearTerrain
    ) {
      const normal =
        terrainNormalAt(
          x,
          z
        );

      nx =
        normal.x;

      ny =
        normal.y;

      nz =
        normal.z;
    }

    let gravityX = 0;
    let gravityY = -GRAVITY;
    let gravityZ = 0;

    if (
      nearTerrain
    ) {
      const gravityNormalComponent =
        gravityY *
        ny;

      gravityX -=
        gravityNormalComponent *
        nx;

      gravityY -=
        gravityNormalComponent *
        ny;

      gravityZ -=
        gravityNormalComponent *
        nz;
    }

    vx +=
      gravityX *
      deltaTime;

    vy +=
      gravityY *
      deltaTime;

    vz +=
      gravityZ *
      deltaTime;

    if (
      nearTerrain
    ) {
      const normalVelocity =
        vx * nx +
        vy * ny +
        vz * nz;

      const tangentX =
        vx -
        nx *
        normalVelocity;

      const tangentY =
        vy -
        ny *
        normalVelocity;

      const tangentZ =
        vz -
        nz *
        normalVelocity;

      const tangentSpeed =
        Math.hypot(
          tangentX,
          tangentY,
          tangentZ
        );

      if (
        tangentSpeed > 0.000001
      ) {
        const dragLength =
          Math.max(
            params.flowDragLength,
            0.001
          );

        const dragAcceleration =
          tangentSpeed *
          tangentSpeed /
          dragLength;

        const dragFactor =
          Math.max(
            0,
            1 -
              dragAcceleration *
              deltaTime /
              tangentSpeed
          );

        vx =
          tangentX *
          dragFactor +
          nx *
          normalVelocity;

        vy =
          tangentY *
          dragFactor +
          ny *
          normalVelocity;

        vz =
          tangentZ *
          dragFactor +
          nz *
          normalVelocity;
      }
    }

    particles.positions[index] =
      x +
      vx *
      deltaTime;

    particles.positions[index + 1] =
      y +
      vy *
      deltaTime;

    particles.positions[index + 2] =
      z +
      vz *
      deltaTime;

    particles.velocities[index] =
      vx;

    particles.velocities[index + 1] =
      vy;

    particles.velocities[index + 2] =
      vz;
  }
}


function resolveTerrainContact(
  index,
  deltaTime
) {
  const positionIndex =
    index * 3;

  const x =
    particles.positions[positionIndex];

  const z =
    particles.positions[positionIndex + 2];

  const surface =
    particleSurfaceHeight(
      x,
      z
    );

  if (
    particles.positions[positionIndex + 1] >
    surface
  ) {
    return;
  }

  particles.positions[positionIndex + 1] =
    surface;

  const normal =
    terrainNormalAt(
      x,
      z
    );

  let vx =
    particles.velocities[positionIndex];

  let vy =
    particles.velocities[positionIndex + 1];

  let vz =
    particles.velocities[positionIndex + 2];

  const normalVelocity =
    vx * normal.x +
    vy * normal.y +
    vz * normal.z;

  if (
    normalVelocity < 0
  ) {
    vx -=
      normal.x *
      normalVelocity;

    vy -=
      normal.y *
      normalVelocity;

    vz -=
      normal.z *
      normalVelocity;
  }

  const correctedNormalVelocity =
    vx * normal.x +
    vy * normal.y +
    vz * normal.z;

  let tangentX =
    vx -
    normal.x *
    correctedNormalVelocity;

  let tangentY =
    vy -
    normal.y *
    correctedNormalVelocity;

  let tangentZ =
    vz -
    normal.z *
    correctedNormalVelocity;

  const tangentSpeed =
    Math.hypot(
      tangentX,
      tangentY,
      tangentZ
    );

  const supportFactor =
    Math.max(
      normal.y,
      0.1
    );

  const downhillAcceleration =
    GRAVITY *
    Math.sqrt(
      Math.max(
        0,
        1 -
          normal.y *
          normal.y
      )
    );

  const kineticFrictionAcceleration =
    params.terrainFriction *
    GRAVITY *
    supportFactor;

  const staticFrictionAcceleration =
    params.terrainFriction *
    params.staticFrictionFactor *
    GRAVITY *
    supportFactor;

  const shouldRemainStatic =
    tangentSpeed <
      STATIC_VELOCITY_THRESHOLD &&
    downhillAcceleration <=
      staticFrictionAcceleration;

  if (
    shouldRemainStatic
  ) {
    tangentX = 0;
    tangentY = 0;
    tangentZ = 0;
  } else if (
    tangentSpeed > 0.000001
  ) {
    const speedReduction =
      kineticFrictionAcceleration *
      deltaTime;

    const factor =
      Math.max(
        0,
        (
          tangentSpeed -
          speedReduction
        ) /
          tangentSpeed
      );

    tangentX *= factor;
    tangentY *= factor;
    tangentZ *= factor;
  }

  particles.velocities[positionIndex] =
    tangentX +
    normal.x *
      Math.max(
        correctedNormalVelocity,
        0
      );

  particles.velocities[positionIndex + 1] =
    tangentY +
    normal.y *
      Math.max(
        correctedNormalVelocity,
        0
      );

  particles.velocities[positionIndex + 2] =
    tangentZ +
    normal.z *
      Math.max(
        correctedNormalVelocity,
        0
      );
}


function resolveParticleCollisions() {
  const diameter =
    Math.max(
      particles.radius * 2,
      0.01
    );

  const hash =
    buildSpatialHash(
      diameter
    );

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const positionIndex =
      i * 3;

    const x =
      particles.positions[positionIndex];

    const y =
      particles.positions[positionIndex + 1];

    const z =
      particles.positions[positionIndex + 2];

    const ix =
      Math.floor(
        x / diameter
      );

    const iy =
      Math.floor(
        y / diameter
      );

    const iz =
      Math.floor(
        z / diameter
      );

    let checked = 0;

    for (
      let dx = -1;
      dx <= 1;
      dx++
    ) {
      for (
        let dy = -1;
        dy <= 1;
        dy++
      ) {
        for (
          let dz = -1;
          dz <= 1;
          dz++
        ) {
          const bucket =
            hash.get(
              spatialKey(
                ix + dx,
                iy + dy,
                iz + dz
              )
            );

          if (
            !bucket
          ) {
            continue;
          }

          for (
            const j of bucket
          ) {
            if (
              j <= i
            ) {
              continue;
            }

            const otherIndex =
              j * 3;

            const offsetX =
              particles.positions[otherIndex] -
              x;

            const offsetY =
              particles.positions[otherIndex + 1] -
              y;

            const offsetZ =
              particles.positions[otherIndex + 2] -
              z;

            const distance =
              Math.hypot(
                offsetX,
                offsetY,
                offsetZ
              );

            if (
              distance >= diameter ||
              distance <= 0.000001
            ) {
              checked++;

              if (
                checked >=
                MAX_COLLISION_NEIGHBOURS
              ) {
                break;
              }

              continue;
            }

            const nx =
              offsetX /
              distance;

            const ny =
              offsetY /
              distance;

            const nz =
              offsetZ /
              distance;

            const overlap =
              diameter -
              distance;

            const correction =
              overlap *
              0.5 *
              0.9;

            particles.positions[positionIndex] -=
              nx *
              correction;

            particles.positions[positionIndex + 1] -=
              ny *
              correction;

            particles.positions[positionIndex + 2] -=
              nz *
              correction;

            particles.positions[otherIndex] +=
              nx *
              correction;

            particles.positions[otherIndex + 1] +=
              ny *
              correction;

            particles.positions[otherIndex + 2] +=
              nz *
              correction;

            const relativeX =
              particles.velocities[positionIndex] -
              particles.velocities[otherIndex];

            const relativeY =
              particles.velocities[positionIndex + 1] -
              particles.velocities[otherIndex + 1];

            const relativeZ =
              particles.velocities[positionIndex + 2] -
              particles.velocities[otherIndex + 2];

            const normalVelocity =
              relativeX * nx +
              relativeY * ny +
              relativeZ * nz;

            if (
              normalVelocity > 0
            ) {
              const normalImpulse =
                (
                  1 +
                  COLLISION_RESTITUTION
                ) *
                normalVelocity *
                0.5;

              particles.velocities[positionIndex] -=
                nx *
                normalImpulse;

              particles.velocities[positionIndex + 1] -=
                ny *
                normalImpulse;

              particles.velocities[positionIndex + 2] -=
                nz *
                normalImpulse;

              particles.velocities[otherIndex] +=
                nx *
                normalImpulse;

              particles.velocities[otherIndex + 1] +=
                ny *
                normalImpulse;

              particles.velocities[otherIndex + 2] +=
                nz *
                normalImpulse;
            }

            const tangentX =
              relativeX -
              nx *
              normalVelocity;

            const tangentY =
              relativeY -
              ny *
              normalVelocity;

            const tangentZ =
              relativeZ -
              nz *
              normalVelocity;

            const tangentSpeed =
              Math.hypot(
                tangentX,
                tangentY,
                tangentZ
              );

            if (
              tangentSpeed > 0.000001
            ) {
              const frictionImpulse =
                normalVelocity > 0
                  ? Math.min(
                      tangentSpeed * 0.5,
                      params.materialFriction *
                        normalVelocity *
                        0.5
                    )
                  : 0;

              const dampingImpulse =
                tangentSpeed *
                0.5 *
                clamp(
                  params.contactDamping,
                  0,
                  1
                );

              const totalImpulse =
                Math.min(
                  tangentSpeed * 0.5,
                  frictionImpulse +
                    dampingImpulse
                );

              const tx =
                tangentX /
                tangentSpeed;

              const ty =
                tangentY /
                tangentSpeed;

              const tz =
                tangentZ /
                tangentSpeed;

              particles.velocities[positionIndex] -=
                tx *
                totalImpulse;

              particles.velocities[positionIndex + 1] -=
                ty *
                totalImpulse;

              particles.velocities[positionIndex + 2] -=
                tz *
                totalImpulse;

              particles.velocities[otherIndex] +=
                tx *
                totalImpulse;

              particles.velocities[otherIndex + 1] +=
                ty *
                totalImpulse;

              particles.velocities[otherIndex + 2] +=
                tz *
                totalImpulse;
            }

            checked++;

            if (
              checked >=
              MAX_COLLISION_NEIGHBOURS
            ) {
              break;
            }
          }

          if (
            checked >=
            MAX_COLLISION_NEIGHBOURS
          ) {
            break;
          }
        }

        if (
          checked >=
          MAX_COLLISION_NEIGHBOURS
        ) {
          break;
        }
      }

      if (
        checked >=
        MAX_COLLISION_NEIGHBOURS
      ) {
        break;
      }
    }
  }
}


/* ------------------------------------------------------------------------- */
/* Erosion and deposition                                                    */
/* ------------------------------------------------------------------------- */

function addPendingTerrainHeightDelta(
  x,
  z,
  volumeDelta
) {
  if (
    !terrainState ||
    !Number.isFinite(
      volumeDelta
    )
  ) {
    return;
  }

  const coordinates =
    terrainGridCoordinates(
      x,
      z
    );

  if (
    !coordinates
  ) {
    return;
  }

  const {
    resolution,
    sizeX,
    sizeZ,
    pendingHeightDelta,
    pendingTouched,
    pendingTouchedFlags
  } = terrainState;

  const {
    x0,
    z0,
    x1,
    z1,
    tx,
    tz
  } = coordinates;

  const cellWidth =
    sizeX /
    Math.max(
      resolution - 1,
      1
    );

  const cellDepth =
    sizeZ /
    Math.max(
      resolution - 1,
      1
    );

  const cellArea =
    Math.max(
      cellWidth *
      cellDepth,
      0.000001
    );

  const heightDelta =
    volumeDelta /
    cellArea;

  const contributions = [
    {
      index:
        z0 * resolution + x0,
      weight:
        (1 - tx) *
        (1 - tz)
    },
    {
      index:
        z0 * resolution + x1,
      weight:
        tx *
        (1 - tz)
    },
    {
      index:
        z1 * resolution + x0,
      weight:
        (1 - tx) *
        tz
    },
    {
      index:
        z1 * resolution + x1,
      weight:
        tx *
        tz
    }
  ];

  for (
    const contribution of contributions
  ) {
    if (
      contribution.weight <= 0
    ) {
      continue;
    }

    const index =
      contribution.index;

    if (
      pendingTouchedFlags[index] === 0
    ) {
      pendingTouchedFlags[index] = 1;
      pendingTouched.push(
        index
      );
    }

    pendingHeightDelta[index] +=
      heightDelta *
      contribution.weight;
  }
}


function getParticleContactData(index) {
  const positionIndex =
    index * 3;

  const x =
    particles.positions[positionIndex];

  const y =
    particles.positions[positionIndex + 1];

  const z =
    particles.positions[positionIndex + 2];

  const terrainSurface =
    particleSurfaceHeight(
      x,
      z
    );

  if (
    y >
    terrainSurface +
    SURFACE_CONTACT_TOLERANCE
  ) {
    return null;
  }

  const normal =
    terrainNormalAt(
      x,
      z
    );

  const vx =
    particles.velocities[positionIndex];

  const vy =
    particles.velocities[positionIndex + 1];

  const vz =
    particles.velocities[positionIndex + 2];

  const normalVelocity =
    vx * normal.x +
    vy * normal.y +
    vz * normal.z;

  const tangentX =
    vx -
    normal.x *
    normalVelocity;

  const tangentY =
    vy -
    normal.y *
    normalVelocity;

  const tangentZ =
    vz -
    normal.z *
    normalVelocity;

  return {
    x,
    z,

    tangentSpeed:
      Math.hypot(
        tangentX,
        tangentY,
        tangentZ
      ),

    slopeStrength:
      Math.sqrt(
        Math.max(
          0,
          1 -
            normal.y *
            normal.y
        )
      )
  };
}


function accumulateTerrainEvolution(
  deltaTime
) {
  if (
    !params.terrainEvolutionEnabled ||
    !terrainState ||
    !particles
  ) {
    return;
  }

  const erosionFraction =
    params.erosionRate /
    100;

  const depositionFraction =
    params.depositionRate /
    100;

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const contact =
      getParticleContactData(
        i
      );

    if (
      !contact
    ) {
      continue;
    }

    const {
      x,
      z,
      tangentSpeed,
      slopeStrength
    } = contact;

    if (
      tangentSpeed >
        params.erosionStartSpeed &&
      slopeStrength >
        MIN_EROSION_SLOPE
    ) {
      const speedFactor =
        clamp(
          (
            tangentSpeed -
            params.erosionStartSpeed
          ) /
            EROSION_SPEED_SCALE,
          0,
          1
        );

      const slopeFactor =
        clamp(
          (
            slopeStrength -
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
          0.75 *
          slopeFactor
        );

      const erosionVolume =
        particles.parcelVolume *
        erosionFraction *
        activity *
        deltaTime;

      addPendingTerrainHeightDelta(
        x,
        z,
        -erosionVolume
      );
    }

    if (
      particles.distanceTraveled[i] >
        0.5 &&
      particles.settledDuration[i] >
        0.1 &&
      tangentSpeed <
        params.depositionSpeed &&
      particles.depositionRemaining[i] >
        0
    ) {
      const speedActivity =
        clamp(
          1 -
            tangentSpeed /
            Math.max(
              params.depositionSpeed,
              0.000001
            ),
          0,
          1
        );

      const settlingActivity =
        clamp(
          particles.settledDuration[i] /
            0.5,
          0,
          1
        );

      const requestedDeposition =
        particles.parcelVolume *
        depositionFraction *
        speedActivity *
        settlingActivity *
        deltaTime;

      const availableDeposition =
        particles.parcelVolume *
        particles.depositionRemaining[i];

      const depositionVolume =
        Math.min(
          requestedDeposition,
          availableDeposition
        );

      if (
        depositionVolume > 0
      ) {
        addPendingTerrainHeightDelta(
          x,
          z,
          depositionVolume
        );

        particles.depositionRemaining[i] -=
          depositionVolume /
          particles.parcelVolume;

        particles.depositionRemaining[i] =
          clamp(
            particles.depositionRemaining[i],
            0,
            1
          );
      }
    }
  }
}


function clearPendingTerrainChanges() {
  if (
    !terrainState
  ) {
    return;
  }

  for (
    const index of terrainState.pendingTouched
  ) {
    terrainState.pendingHeightDelta[index] =
      0;

    terrainState.pendingTouchedFlags[index] =
      0;
  }

  terrainState.pendingTouched.length =
    0;
}


function applyTerrainEvolution() {
  if (
    !terrainState ||
    terrainState.pendingTouched.length === 0
  ) {
    return;
  }

  const {
    heights,
    pendingHeightDelta,
    pendingTouched,
    pendingTouchedFlags
  } = terrainState;

  let changed = false;

  for (
    const index of pendingTouched
  ) {
    const requestedDelta =
      pendingHeightDelta[index];

    const limitedDelta =
      clamp(
        requestedDelta,
        -MAX_TERRAIN_CHANGE_PER_UPDATE,
        MAX_TERRAIN_CHANGE_PER_UPDATE
      );

    const oldHeight =
      heights[index];

    const newHeight =
      Math.max(
        0,
        oldHeight +
          limitedDelta
      );

    heights[index] =
      newHeight;

    if (
      Math.abs(
        newHeight -
        oldHeight
      ) > 0.0000001
    ) {
      changed = true;
    }

    pendingHeightDelta[index] =
      0;

    pendingTouchedFlags[index] =
      0;
  }

  pendingTouched.length =
    0;

  if (
    changed
  ) {
    refreshTerrainAfterHeightChange();
  }
}


function updateTerrainEvolution(
  deltaTime
) {
  if (
    !params.terrainEvolutionEnabled ||
    !terrainState
  ) {
    return;
  }

  terrainState.evolutionAccumulator +=
    deltaTime;

  if (
    terrainState.evolutionAccumulator <
    TERRAIN_EVOLUTION_INTERVAL
  ) {
    return;
  }

  terrainState.evolutionAccumulator %=
    TERRAIN_EVOLUTION_INTERVAL;

  applyTerrainEvolution();
}


function resetTerrainEvolution() {
  if (
    !terrainState ||
    !terrainState.originalHeights
  ) {
    return;
  }

  terrainState.heights.set(
    terrainState.originalHeights
  );

  terrainState.evolutionAccumulator =
    0;

  clearPendingTerrainChanges();

  refreshTerrainAfterHeightChange(
    false
  );
}


/* ------------------------------------------------------------------------- */
/* Physics update                                                            */
/* ------------------------------------------------------------------------- */

function updatePhysics(deltaTime) {
  if (
    !particles
  ) {
    return false;
  }

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const index =
      i * 3;

    particles.lastPositions[index] =
      particles.positions[index];

    particles.lastPositions[index + 1] =
      particles.positions[index + 1];

    particles.lastPositions[index + 2] =
      particles.positions[index + 2];
  }

  applyCohesion(
    deltaTime
  );

  applyForcesAndIntegrate(
    deltaTime
  );

  for (
    let iteration = 0;
    iteration < COLLISION_ITERATIONS;
    iteration++
  ) {
    resolveParticleCollisions();

    for (
      let i = 0;
      i < particles.count;
      i++
    ) {
      resolveTerrainContact(
        i,
        deltaTime
      );
    }
  }

  accumulateTerrainEvolution(
    deltaTime
  );

  updateTerrainEvolution(
    deltaTime
  );

  let allSettled = true;

  for (
    let i = 0;
    i < particles.count;
    i++
  ) {
    const index =
      i * 3;

    const vx =
      particles.velocities[index];

    const vy =
      particles.velocities[index + 1];

    const vz =
      particles.velocities[index + 2];

    const speed =
      Math.hypot(
        vx,
        vy,
        vz
      );

    const movement =
      Math.hypot(
        particles.positions[index] -
          particles.lastPositions[index],

        particles.positions[index + 1] -
          particles.lastPositions[index + 1],

        particles.positions[index + 2] -
          particles.lastPositions[index + 2]
      );

    particles.distanceTraveled[i] +=
      movement;

    if (
      speed <
        params.minimumMovementSpeed &&
      movement < 0.001
    ) {
      particles.settledDuration[i] +=
        deltaTime;

      if (
        particles.settledDuration[i] >
        0.25
      ) {
        particles.velocities[index] =
          0;

        particles.velocities[index + 1] =
          0;

        particles.velocities[index + 2] =
          0;
      }
    } else {
      particles.settledDuration[i] =
        0;
    }

    if (
      particles.settledDuration[i] <
      SETTLE_TIME
    ) {
      allSettled = false;
    }
  }

  return (
    simulation.time > 0.7 &&
    allSettled
  );
}


/* ------------------------------------------------------------------------- */
/* Simulation cache                                                         */
/* ------------------------------------------------------------------------- */

function updateTimelineInterface() {
  const hasTimeline =
    cacheFrames.length >= 2;

  ui.timelineWrap.classList.toggle(
    "hidden",
    !hasTimeline
  );

  if (
    !hasTimeline
  ) {
    return;
  }

  ui.timeline.max =
    String(
      cacheFrames.length - 1
    );

  const activeIndex =
    replayMode &&
    replayIndex >= 0
      ? replayIndex
      : cacheFrames.length - 1;

  ui.timeline.value =
    String(
      clamp(
        activeIndex,
        0,
        cacheFrames.length - 1
      )
    );

  const frame =
    cacheFrames[
      Number(
        ui.timeline.value
      )
    ];

  ui.timelineReadout.textContent =
    frame
      ? formatTime(
          frame.time
        )
      : "0.00 s";
}


function clearSimulationCache() {
  cacheFrames = [];
  replayMode = false;
  replayIndex = -1;

  updateTimelineInterface();
}


function recordSimulationSnapshot(
  force = false
) {
  if (
    !particles
  ) {
    return;
  }

  const lastFrame =
    cacheFrames[
      cacheFrames.length - 1
    ];

  if (
    !force &&
    lastFrame &&
    Math.abs(
      lastFrame.time -
        simulation.time
    ) < 0.0001
  ) {
    return;
  }

  cacheFrames.push({
    time:
      simulation.time,

    positions:
      particles.positions.slice(),

    velocities:
      particles.velocities.slice(),

    distanceTraveled:
      particles.distanceTraveled.slice(),

    depositionRemaining:
      particles.depositionRemaining.slice(),

    terrainHeights:
      params.terrainEvolutionEnabled &&
      terrainState
        ? terrainState.heights.slice()
        : null
  });

  while (
    cacheFrames.length >
    MAX_CACHE_FRAMES
  ) {
    cacheFrames.shift();
  }

  updateTimelineInterface();
}


function restoreSimulationSnapshot(index) {
  if (
    !particles ||
    index < 0 ||
    index >= cacheFrames.length
  ) {
    return;
  }

  const snapshot =
    cacheFrames[index];

  particles.positions.set(
    snapshot.positions
  );

  particles.velocities.set(
    snapshot.velocities
  );

  particles.distanceTraveled.set(
    snapshot.distanceTraveled
  );

  particles.depositionRemaining.set(
    snapshot.depositionRemaining
  );

  particles.settledDuration.fill(
    0
  );

  if (
    snapshot.terrainHeights &&
    terrainState
  ) {
    terrainState.heights.set(
      snapshot.terrainHeights
    );

    clearPendingTerrainChanges();

    refreshTerrainAfterHeightChange(
      false
    );
  }

  simulation.time =
    snapshot.time;

  simulation.accumulator =
    0;

  simulation.cacheAccumulator =
    0;

  syncPointParticles();
  updateParticleColors();
}


function handleTimelineInput() {
  if (
    cacheFrames.length < 1
  ) {
    return;
  }

  const index =
    Number(
      ui.timeline.value
    );

  replayMode = true;
  replayIndex = index;

  params.running =
    false;

  simulation.state =
    "replay";

  simulation.started =
    true;

  sourceGroup.visible =
    false;

  restoreSimulationSnapshot(
    index
  );

  const frame =
    cacheFrames[index];

  setStatus(
    frame
      ? `REPLAY ${formatTime(
          frame.time
        )}`
      : "REPLAY"
  );

  updatePlayButton();
  updateTimelineInterface();
}


/* ------------------------------------------------------------------------- */
/* Simulation controls                                                       */
/* ------------------------------------------------------------------------- */

function updatePlayButton() {
  ui.playButton.textContent =
    params.running
      ? "PAUSE"
      : "PLAY";
}


function startSimulation() {
  if (
    params.releaseShapeMode ===
      "polygon" &&
    !source.customPolygonLocal
  ) {
    setStatus(
      "DRAW A CUSTOM RELEASE SHAPE FIRST"
    );

    return;
  }

  if (
    !particles
  ) {
    resetSimulation();
  }

  if (
    replayMode
  ) {
    const selectedIndex =
      Math.max(
        0,
        replayIndex
      );

    cacheFrames =
      cacheFrames.slice(
        0,
        selectedIndex + 1
      );

    replayMode = false;
    replayIndex = -1;
  }

  simulation.started =
    true;

  simulation.state =
    "running";

  params.running =
    true;

  sourceGroup.visible =
    false;

  setStatus(
    "RUNNING"
  );

  updatePlayButton();
  updateTimelineInterface();
}


function pauseSimulation() {
  params.running =
    false;

  simulation.state =
    "paused";

  setStatus(
    "PAUSED"
  );

  updatePlayButton();
}


function finishSimulation() {
  params.running =
    false;

  simulation.state =
    "finished";

  recordSimulationSnapshot(
    true
  );

  setStatus(
    "FINISHED — ALL PARTICLES STOPPED"
  );

  updatePlayButton();
  updateTimelineInterface();
}


function resetSimulation() {
  params.running =
    false;

  resetTerrainEvolution();

  simulation.started =
    false;

  simulation.time =
    0;

  simulation.accumulator =
    0;

  simulation.cacheAccumulator =
    0;

  simulation.state =
    "paused";

  source.drawing =
    false;

  source.draftWorld =
    [];

  updateDraftLine();
  clearSimulationCache();

  generateParticles();
  createParticleVisual();
  updateParticleColors();
  syncPointParticles();

  sourceGroup.visible =
    true;

  updateSourceVisuals();

  recordSimulationSnapshot(
    true
  );

  setStatus(
    "PAUSED"
  );

  updatePlayButton();
  updateParticleReadout();
}


function simulateFrame(realDeltaTime) {
  if (
    !params.running ||
    replayMode ||
    !particles
  ) {
    return;
  }

  simulation.accumulator +=
    Math.min(
      realDeltaTime,
      0.1
    ) *
    params.simulationSpeed;

  let substeps = 0;

  while (
    simulation.accumulator >=
      PHYSICS_STEP &&
    substeps <
      MAX_PHYSICS_SUBSTEPS
  ) {
    const finished =
      updatePhysics(
        PHYSICS_STEP
      );

    simulation.time +=
      PHYSICS_STEP;

    simulation.accumulator -=
      PHYSICS_STEP;

    simulation.cacheAccumulator +=
      PHYSICS_STEP;

    while (
      simulation.cacheAccumulator >=
      CACHE_INTERVAL
    ) {
      simulation.cacheAccumulator -=
        CACHE_INTERVAL;

      recordSimulationSnapshot();
    }

    substeps++;

    if (
      finished
    ) {
      syncPointParticles();
      updateParticleColors();
      finishSimulation();

      return;
    }
  }

  syncPointParticles();
  updateParticleColors();
}


/* ------------------------------------------------------------------------- */
/* Pointer interaction                                                       */
/* ------------------------------------------------------------------------- */

function updatePointerFromEvent(event) {
  const rectangle =
    renderer.domElement.getBoundingClientRect();

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
}


function terrainPointFromEvent(event) {
  if (
    !terrainMesh
  ) {
    return null;
  }

  updatePointerFromEvent(
    event
  );

  raycaster.setFromCamera(
    pointer,
    camera
  );

  const intersections =
    raycaster.intersectObject(
      terrainMesh,
      false
    );

  if (
    intersections.length === 0
  ) {
    return null;
  }

  const point =
    intersections[0].point;

  return new THREE.Vector2(
    point.x,
    point.z
  );
}


function moveSourceTo(point) {
  source.center.copy(
    point
  );

  updateSourceVisuals();
  requestParticleReset();

  setStatus(
    "SOURCE MOVED"
  );
}


function pointerDownCapture(event) {
  if (
    event.button !== 0
  ) {
    return;
  }

  const modifierPressed =
    event.metaKey ||
    event.ctrlKey;

  const polygonMode =
    params.releaseShapeMode ===
    "polygon";

  if (
    polygonMode &&
    modifierPressed
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const point =
      terrainPointFromEvent(
        event
      );

    if (
      !point
    ) {
      return;
    }

    if (
      !source.drawing
    ) {
      source.drawing =
        true;

      source.draftWorld =
        [];

      setStatus(
        "DRAWING RELEASE SHAPE"
      );
    }

    addDraftPoint(
      point
    );

    return;
  }

  if (
    event.shiftKey &&
    !source.drawing &&
    !params.running
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const point =
      terrainPointFromEvent(
        event
      );

    if (
      !point
    ) {
      return;
    }

    moveSourceTo(
      point
    );
  }
}


renderer.domElement.addEventListener(
  "pointerdown",
  pointerDownCapture,
  true
);


window.addEventListener(
  "keydown",
  (event) => {
    if (
      !source.drawing
    ) {
      return;
    }

    if (
      event.key === "Enter"
    ) {
      event.preventDefault();
      finishCustomShape();
    }

    if (
      event.key === "Escape"
    ) {
      event.preventDefault();

      source.drawing =
        false;

      source.draftWorld =
        [];

      updateDraftLine();

      setStatus(
        "DRAWING CANCELLED"
      );
    }

    if (
      event.key === "Backspace"
    ) {
      event.preventDefault();

      source.draftWorld.pop();
      updateDraftLine();

      setStatus(
        "DRAWING RELEASE SHAPE"
      );
    }
  }
);


/* ------------------------------------------------------------------------- */
/* Model loading                                                             */
/* ------------------------------------------------------------------------- */

const EXAMPLE_TERRAIN_URL =
  "./example/kandersteg.stl";


async function importTerrainSource(
  fileName,
  source
) {
  const extension =
    fileName
      .split("?")[0]
      .split(".")
      .pop()
      .toLowerCase();

  let object;

  if (
    extension === "obj"
  ) {
    object =
      new OBJLoader().parse(
        source.text
      );
  } else {
    let geometry;

    if (
      extension === "ply"
    ) {
      geometry =
        new PLYLoader().parse(
          source.buffer
        );
    }

    if (
      extension === "stl"
    ) {
      geometry =
        new STLLoader().parse(
          source.buffer
        );
    }

    if (
      !geometry
    ) {
      throw new Error(
        "Unsupported terrain format"
      );
    }

    object =
      new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial()
      );
  }

  const points =
    extractPointsFromObject(
      object
    );

  if (
    points.length < 3
  ) {
    throw new Error(
      "No usable vertices found"
    );
  }

  importedRawPoints =
    points;

  buildCurrentTerrain();
  resetSimulation();
}


async function loadTerrainFile(file) {
  if (
    !file
  ) {
    return;
  }

  try {
    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    if (
      extension === "obj"
    ) {
      const text =
        await file.text();

      await importTerrainSource(
        file.name,
        {
          text
        }
      );
    } else {
      const buffer =
        await file.arrayBuffer();

      await importTerrainSource(
        file.name,
        {
          buffer
        }
      );
    }

    setStatus(
      `IMPORTED ${extension.toUpperCase()} TERRAIN`
    );
  } catch (error) {
    console.error(
      error
    );

    setStatus(
      "MODEL IMPORT FAILED"
    );
  }
}


async function loadExampleTerrain() {
  try {
    setStatus(
      "LOADING EXAMPLE TERRAIN"
    );

    const response =
      await fetch(
        EXAMPLE_TERRAIN_URL
      );

    if (
      !response.ok
    ) {
      throw new Error(
        `Could not load ${EXAMPLE_TERRAIN_URL}`
      );
    }

    const fileName =
      EXAMPLE_TERRAIN_URL
        .split("?")[0]
        .split("/")
        .pop();

    const extension =
      fileName
        .split(".")
        .pop()
        .toLowerCase();

    if (
      extension === "obj"
    ) {
      const text =
        await response.text();

      await importTerrainSource(
        fileName,
        {
          text
        }
      );
    } else {
      const buffer =
        await response.arrayBuffer();

      await importTerrainSource(
        fileName,
        {
          buffer
        }
      );
    }

    setStatus(
      `EXAMPLE ${extension.toUpperCase()} TERRAIN`
    );
  } catch (error) {
    console.error(
      error
    );

    setStatus(
      "EXAMPLE TERRAIN LOAD FAILED"
    );
  }
}


ui.chooseModelButton.addEventListener(
  "click",
  () => {
    ui.modelFileInput.click();
  }
);


ui.dropZone.addEventListener(
  "click",
  () => {
    ui.modelFileInput.click();
  }
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

    ui.dropZone.classList.add(
      "dragover"
    );
  }
);


ui.dropZone.addEventListener(
  "dragleave",
  () => {
    ui.dropZone.classList.remove(
      "dragover"
    );
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


/* ------------------------------------------------------------------------- */
/* UI bindings                                                               */
/* ------------------------------------------------------------------------- */

bindRangeAndNumber(
  ui.materialFriction,
  ui.materialFrictionNumber,
  "materialFriction"
);


bindRangeAndNumber(
  ui.terrainFriction,
  ui.terrainFrictionNumber,
  "terrainFriction"
);


bindRangeAndNumber(
  ui.staticFrictionFactor,
  ui.staticFrictionFactorNumber,
  "staticFrictionFactor"
);


bindRangeAndNumber(
  ui.particleCohesion,
  ui.particleCohesionNumber,
  "particleCohesion"
);


bindRangeAndNumber(
  ui.cohesionRestDistanceFactor,
  ui.cohesionRestDistanceFactorNumber,
  "cohesionRestDistanceFactor"
);


bindRangeAndNumber(
  ui.contactDamping,
  ui.contactDampingNumber,
  "contactDamping"
);


bindRangeAndNumber(
  ui.flowDragLength,
  ui.flowDragLengthNumber,
  "flowDragLength"
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
  ui.startVelocity,
  ui.startVelocityNumber,
  "startVelocity",
  () => {},
  requestParticleReset
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
  requestParticleReset
);


bindRangeAndNumber(
  ui.directionX,
  ui.directionXNumber,
  "directionX",
  () => {},
  requestParticleReset
);


bindRangeAndNumber(
  ui.directionZ,
  ui.directionZNumber,
  "directionZ",
  () => {},
  requestParticleReset
);


bindRangeAndNumber(
  ui.terrainResolution,
  ui.terrainResolutionNumber,
  "terrainResolution",
  () => {},
  () => {
    if (
      !params.running
    ) {
      buildCurrentTerrain();
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
    if (
      !params.running
    ) {
      buildCurrentTerrain();
      resetSimulation();
    }
  }
);


bindRangeAndNumber(
  ui.metersPerModelUnit,
  ui.metersPerModelUnitNumber,
  "metersPerModelUnit",
  () => {},
  () => {
    if (
      !params.running
    ) {
      buildCurrentTerrain();
      resetSimulation();
    }
  }
);


bindRangeAndNumber(
  ui.verticalExaggeration,
  ui.verticalScaleNumber,
  "verticalExaggeration",
  () => {},
  () => {
    if (
      !params.running
    ) {
      buildCurrentTerrain();
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
    if (
      !params.running
    ) {
      buildCurrentTerrain();
      resetSimulation();
    }
  }
);


bindRangeAndNumber(
  ui.sourceArea,
  ui.sourceAreaNumber,
  "sourceArea",
  () => {
    updateSourceVisuals();
    updateParticleReadout();
  },
  requestParticleReset
);


bindRangeAndNumber(
  ui.sourceVolume,
  ui.sourceVolumeNumber,
  "sourceVolume",
  () => {
    updateSourceVisuals();
    updateParticleReadout();
  },
  requestParticleReset
);


bindRangeAndNumber(
  ui.particleDensity,
  ui.particleDensityNumber,
  "particleDensity",
  updateParticleReadout,
  requestParticleReset
);


bindRangeAndNumber(
  ui.particleSize,
  ui.particleSizeNumber,
  "particleSize",
  () => {
    updateParticleColors();
  }
);


bindRangeAndNumber(
  ui.rotationX,
  ui.rotationXNumber,
  "rotationX",
  () => {},
  () => {
    if (
      !params.running &&
      importedRawPoints
    ) {
      buildCurrentTerrain();
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
      !params.running &&
      importedRawPoints
    ) {
      buildCurrentTerrain();
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
      !params.running &&
      importedRawPoints
    ) {
      buildCurrentTerrain();
      resetSimulation();
    }
  }
);


ui.terrainEvolutionEnabled.addEventListener(
  "change",
  () => {
    params.terrainEvolutionEnabled =
      ui.terrainEvolutionEnabled.checked;

    if (
      !params.terrainEvolutionEnabled
    ) {
      clearPendingTerrainChanges();
      resetTerrainEvolution();
    }
  }
);


ui.startDirectionMode.addEventListener(
  "change",
  () => {
    params.startDirectionMode =
      ui.startDirectionMode.value;

    updateDirectionVisibility();
    requestParticleReset();
  }
);


ui.releaseShapeMode.addEventListener(
  "change",
  () => {
    params.releaseShapeMode =
      ui.releaseShapeMode.value;

    updateShapeVisibility();
    updateSourceVisuals();

    if (
      params.releaseShapeMode ===
      "polygon"
    ) {
      setStatus(
        "HOLD CMD OR CTRL AND CLICK TERRAIN"
      );
    } else {
      setStatus(
        "SQUARE RELEASE AREA"
      );
    }

    requestParticleReset();
  }
);


ui.colorMode.addEventListener(
  "change",
  () => {
    params.colorMode =
      ui.colorMode.value;

    updateParticleColors();
  }
);


ui.drawReleaseShapeButton.addEventListener(
  "click",
  () => {
    params.releaseShapeMode =
      "polygon";

    ui.releaseShapeMode.value =
      "polygon";

    updateShapeVisibility();

    source.drawing =
      true;

    source.draftWorld =
      [];

    updateDraftLine();

    setStatus(
      "HOLD CMD OR CTRL AND CLICK TERRAIN"
    );
  }
);


ui.clearReleaseShapeButton.addEventListener(
  "click",
  clearCustomShape
);


ui.resetOrientationButton.addEventListener(
  "click",
  () => {
    params.rotationX = 0;
    params.rotationY = 0;
    params.rotationZ = 0;

    setSliderAndNumber(
      ui.rotationX,
      ui.rotationXNumber,
      0
    );

    setSliderAndNumber(
      ui.rotationY,
      ui.rotationYNumber,
      0
    );

    setSliderAndNumber(
      ui.rotationZ,
      ui.rotationZNumber,
      0
    );

    if (
      importedRawPoints
    ) {
      buildCurrentTerrain();
    }

    resetSimulation();
  }
);


ui.playButton.addEventListener(
  "click",
  () => {
    if (
      params.running
    ) {
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
    const newVolume =
      clamp(
        params.sourceVolume + 1000,
        MIN_SOURCE_VOLUME,
        MAX_SOURCE_VOLUME
      );

    params.sourceVolume =
      newVolume;

    setSliderAndNumber(
      ui.sourceVolume,
      ui.sourceVolumeNumber,
      newVolume
    );

    updateSourceVisuals();
    updateParticleReadout();
    requestParticleReset();
  }
);


ui.terrainButton.addEventListener(
  "click",
  () => {
    importedRawPoints =
      null;

    buildProceduralTerrain();
    resetSimulation();

    setStatus(
      "NEW ALPINE TERRAIN"
    );
  }
);

ui.exampleTerrainButton.addEventListener(
  "click",
  loadExampleTerrain
);


ui.timeline.addEventListener(
  "input",
  handleTimelineInput
);


/* ------------------------------------------------------------------------- */
/* Resize and animation                                                      */
/* ------------------------------------------------------------------------- */

function resizeRenderer() {
  const width =
    ui.viewer.clientWidth;

  const height =
    ui.viewer.clientHeight;

  if (
    width <= 0 ||
    height <= 0
  ) {
    return;
  }

  renderer.setSize(
    width,
    height,
    false
  );

  camera.aspect =
    width /
    height;

  camera.updateProjectionMatrix();
}


window.addEventListener(
  "resize",
  resizeRenderer
);


let previousTime =
  performance.now();


function animate(currentTime) {
  const deltaTime =
    Math.min(
      (
        currentTime -
        previousTime
      ) / 1000,
      0.1
    );

  previousTime =
    currentTime;

  controls.update();

  simulateFrame(
    deltaTime
  );

  renderer.render(
    scene,
    camera
  );

  requestAnimationFrame(
    animate
  );
}

/* -------------------------------------------------------------------------- */
/* DESCRIPTION DIALOG                                                         */
/* -------------------------------------------------------------------------- */

function openDescriptionDialog() {
  var dialog =
    getElement("descriptionDialog");

  if (!dialog) {
    return;
  }

  if (typeof dialog.showModal === "function") {
    if (!dialog.open) {
      dialog.showModal();
    }

    return;
  }

  /*
    Fallback for browsers without dialog.showModal().
  */
  dialog.setAttribute("open", "");
}

function closeDescriptionDialog() {
  var dialog =
    getElement("descriptionDialog");

  if (!dialog) {
    return;
  }

  if (
    typeof dialog.close === "function" &&
    dialog.open
  ) {
    dialog.close();
    return;
  }

  dialog.removeAttribute("open");
}

function bindDescriptionDialog() {
  var dialog =
    getElement("descriptionDialog");

  var openButton =
    getElement("OpenDescription");

  var closeButton =
    getElement("closeDescription");

  if (!dialog) {
    console.warn("descriptionDialog was not found.");
    return;
  }

  if (openButton) {
    openButton.addEventListener(
      "click",
      function () {
        openDescriptionDialog();
      }
    );
  } else {
    console.warn("OpenDescription button was not found.");
  }

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      function () {
        closeDescriptionDialog();
      }
    );
  }

  /*
    Close when clicking the dialog backdrop.
  */
  dialog.addEventListener(
    "click",
    function (event) {
      if (event.target === dialog) {
        closeDescriptionDialog();
      }
    }
  );

  /*
    Allow closing with the Escape key.
  */
  dialog.addEventListener(
    "cancel",
    function () {
      closeDescriptionDialog();
    }
  );
}


/* ------------------------------------------------------------------------- */
/* Initialisation                                                             */
/* ------------------------------------------------------------------------- */

syncInitialUi();

updateDirectionVisibility();
updateShapeVisibility();
updateParticleReadout();
resizeRenderer();

buildCurrentTerrain();
resetSimulation();

requestAnimationFrame(
  animate
);
