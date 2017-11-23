// region entities
class Entity {
  constructor() {
    this.unitId = 0;
    this.radius = 0;
    this.x = 0;
    this.y = 0;
  }
}
class Looter extends Entity {
  constructor() {
    super();
    this.playerId = 0;
    this.mass = 0;
    this.friction = 0;
    this.vx = 0;
    this.vy = 0;
  }
}

class Reaper extends Looter {
  constructor() {
    super();
    this.score = 0;
    this.rage = 0;
    this.mass = 0.5;
    this.friction = 0.2;
  }
}

class Destroyer extends Looter {
  constructor() {
    super();
    this.mass = 1.5;
    this.friction = 0.3;
  }
}

class Doof extends Looter {
  constructor() {
    super();
    this.mass = 1;
    this.friction = 0.25;
  }
}

class Tanker extends Entity {
  constructor() {
    super();
    this.mass = 0;
    this.friction = 0.4;
    this.vx = 0;
    this.vy = 0;
    this.water = 0;
    this.capacity = 0;
  }
}

class Wreck extends Entity {
  constructor() {
    super();
    this.water = 0;
    this.distToMyReaper = 0;
  }
}

class Tar extends Entity {
  constructor() {
    super();

    remainingTime = 3;
  }
}

class Oil extends Entity {
  constructor() {
    super();

    remainingTime = 3;
  }
}
// endregion entities

const minThrottle = 0, maxThrottle = 300;
const skillRange = 2000, skillRadius = 1000;
const doofTargetRadius = (skillRange - skillRadius) / 2;

const costOfTar = 30, costOfGrenade = 60, costOfOil = 30;

let stepNum = 0;

let reapers, myReaper, enReaper1, enReaper2;
let destroyers, myDestroyer, enDestroyer1, enDestroyer2;
let doofs, myDoof, enDoof1, enDoof2;
let tankers, wrecks, tars, oils;
let entitiesToAvoid;

// initialization
function initialize() {

}

function gameLoop() {
  while (true) {
    resetStepValues();
    readStepValues();
    step();
  }
}

function resetStepValues() {
  myReaper = new Reaper();
  enReaper1 = new Reaper();
  enReaper2 = new Reaper();
  reapers = [myReaper, enReaper1, enReaper2];

  myDestroyer = new Destroyer();
  enDestroyer1 = new Destroyer();
  enDestroyer2 = new Destroyer();
  destroyers = [myDestroyer, enDestroyer1, enDestroyer2];

  myDoof = new Doof();
  enDoof1 = new Doof();
  enDoof2 = new Doof();
  doofs = [myDoof, enDoof1, enDoof2];

  entitiesToAvoid = [
    enReaper1, enReaper2,
    enDestroyer1, enDestroyer2,
    enDoof1, enDoof2
  ];

  tankers = [];
  wrecks = [];
  tars = [];
  oils = [];
}

function readStepValues() {
  myReaper.score = parseInt(readline());
  enReaper1.score = parseInt(readline());
  enReaper2.score = parseInt(readline());

  myReaper.rage = parseInt(readline());
  enReaper1.rage = parseInt(readline());
  enReaper2.rage = parseInt(readline());

  const unitCount = parseInt(readline());
  for (let i = 0; i < unitCount; i++) {
    const inputs = readline().split(' ');

    const unitType = parseInt(inputs[1]);
    const playerId = parseInt(inputs[2]);

    switch (unitType) {
      case 0: // reapers
        initLooter(reapers, playerId, inputs);
        break;

      case 1: // destroyers
        initLooter(destroyers, playerId, inputs);
        break;

      case 2: // doofs
        initLooter(doofs, playerId, inputs);
        break;

      case 3: // tankers
        const tanker = new Tanker();
        tanker.unitId = parseInt(inputs[0]);
        tanker.mass = parseFloat(inputs[3]);
        tanker.radius = parseInt(inputs[4]);
        tanker.x = parseInt(inputs[5]);
        tanker.y = parseInt(inputs[6]);
        tanker.vx = parseInt(inputs[7]);
        tanker.vy = parseInt(inputs[8]);
        tanker.water = parseInt(inputs[9]);
        tanker.capacity = parseInt(inputs[10]);

        tankers.push(tanker);
        entitiesToAvoid.push(tanker);
        break;

      case 4: // wrecks
        const wreck = new Wreck();
        wreck.unitId = parseInt(inputs[0]);
        wreck.radius = parseInt(inputs[4]);
        wreck.x = parseInt(inputs[5]);
        wreck.y = parseInt(inputs[6]);
        wreck.water = parseInt(inputs[9]);
        wreck.distToMyReaper = getLength(myReaper, wreck);

        wrecks.push(wreck);
        break;

      case 5: // oils
        const oil = new Oil();
        oil.unitId = parseInt(inputs[0]);
        oil.radius = parseInt(inputs[4]);
        oil.x = parseInt(inputs[5]);
        oil.y = parseInt(inputs[6]);
        oil.remainingTime = parseInt(inputs[9]);

        oils.push(oil);
        entitiesToAvoid.push(oil);
        break;
    }
  }

  function initLooter(looters, playerId, inputs) {
    const looter = looters[playerId];
    looter.unitId = parseInt(inputs[0]);
    looter.playerId = playerId;
    looter.mass = parseFloat(inputs[3]);
    looter.radius = parseInt(inputs[4]);
    looter.x = parseInt(inputs[5]);
    looter.y = parseInt(inputs[6]);
    looter.vx = parseInt(inputs[7]);
    looter.vy = parseInt(inputs[8]);
  }
}

function step() {
  ++stepNum;
  doPhase();
}

function doPhase() {

  print(getReaperMove());

  print(getDestroyerMove());

  const doofMove = getDoofMove();
  print(`${doofMove.x} ${doofMove.y} ${doofMove.throttle}`);
}

// region Reaper move
function getReaperMove() {
  const wreck = getBestWreck(wrecks, entitiesToAvoid);

  if (wreck) {
    const move = calcThrottle(myReaper, wreck);
    return `${move.x} ${move.y} ${move.throttle | 0}`;
  } else {
    return 'WAIT';
  }
}

let lastWreckId = -1;
function getBestWreck(wrecks, entitiesToAvoid) {
  wrecks.sort((a, b) => a.distToMyReaper - b.distToMyReaper);

  const coefs = [];
  const n = 3;

  for (let i = 0; i < wrecks.length && i !== n; ++i) {
    const wreck = wrecks[i];
    let coef = 100 / wreck.distToMyReaper + 0.1 * wreck.water;
    if (wreck.unitId === lastWreckId) {
      ++coef;
    }

    for (let j = 0; j !== entitiesToAvoid.length && coef > -n; ++j) {
      if (getLength(entitiesToAvoid[j], wreck) < 1.5 * wreck.radius) {
        --coef;
      }
    }

    coefs[i] = coef;
  }

  let max = -100, maxK = -1;
  for (let i = 0; i !== n; ++i) {
    if (coefs[i] > max) {
      max = coefs[i];
      maxK = i;
    }
  }

  const best = wrecks[maxK];
  lastWreckId = best && best.unitId || -1;

  return best;
}
// endregion Reaper move

// region Destroyer move
function getDestroyerMove() {
  const distToReaper = getLength(myReaper, myDoof);
  if (distToReaper <= skillRange && myReaper.rage >= costOfGrenade) {
    return `SKILL ${myReaper.x} ${myReaper.y}`;
  }

  const k = (distToReaper - doofTargetRadius) / distToReaper;
  const targetX = Math.round(k * (myReaper.x - myDoof.x));
  const targetY = Math.round(k * (myReaper.y - myDoof.y));

  return `${targetX} ${targetY} 300`;
}
// endregion Destroyer move


// region Doof move
function getDoofMove() {
  const dist1 = getLength(myDoof, enReaper1);
  const dist2 = getLength(myDoof, enReaper2);
  if (dist1 > dist2) {
    return {
      x: enReaper1.x,
      y: enReaper1.y,
      throttle: 300
    };
  }
  return {
    x: enReaper2.x,
    y: enReaper2.y,
    throttle: 300
  };
}
// endregion Doof move

// region utils
function debug(message) {
  if (typeof message === 'object') {
    debug(JSON.stringify(message));
    return;
  }

  printErr(message);
}

function shallowCopy(obj) {
  return Object.assign({}, obj);
}

const zero = { x: 0, y: 0 };
function getLength(a, b) {
  b = b || zero;
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function calcThrottle(unit, target) {
  const fixedX = target.x - unit.vx;
  const fixedY = target.y - unit.vy;
  const dist = getLength(unit, target);
  const throttle = unit.mass * dist;

  const move = {
    x: fixedX,
    y: fixedY,
    throttle
  };

  return move;
}

function multVectors(a, b) {
  return a.x * b.x + a.y * b.y;
}
//endregion utils

if (typeof global === 'undefined' || !global.inTest) {
  initialize();
  gameLoop();
} else {
  module.exports = {
    Reaper,
    Destroyer,
    Tanker,
    Wreck,
    getLength,
    getBestWreck,
    calcThrottle
  };
}
