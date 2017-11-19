class Reaper {
  constructor() {
    this.unitId = 0;
    this.playerId = 0;
    this.score = 0;
    this.rage = 0;
    this.mass = 0;
    this.radius = 0;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
  }
}

class Destroyer {
  constructor() {
    this.unitId = 0;
    this.playerId = 0;
    this.mass = 0;
    this.radius = 0;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
  }
}

class Tanker {
  constructor() {
    this.unitId = 0;
    this.mass = 0;
    this.radius = 0;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.water = 0;
    this.capacity = 0;
  }
}

class Wreck {
  constructor() {
    this.unitId = 0;
    this.radius = 0;
    this.x = 0;
    this.y = 0;
    this.water = 0;
  }
}

let stepNum = 0;

let reapers, myReaper, enReaper1, enReaper2;
let destroyers, myDestroyer, enDestoryer1, enDestoryer2;
let tankers, wrecks;

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
  enDestoryer1 = new Destroyer();
  enDestoryer2 = new Destroyer();
  destroyers = [myDestroyer, enDestoryer1, enDestoryer2];

  tankers = [];
  wrecks = [];
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

    const unitId = parseInt(inputs[0]);
    const unitType = parseInt(inputs[1]);
    const playerId = parseInt(inputs[2]);

    switch (unitType) {
      case 0: // reapers
        const r = reapers[playerId];
        r.unitId = unitId;
        r.playerId = playerId;
        r.mass = parseInt(inputs[3]);
        r.radius = parseInt(inputs[4]);
        r.x = parseInt(inputs[5]);
        r.y = parseInt(inputs[6]);
        r.vx = parseInt(inputs[7]);
        r.vy = parseInt(inputs[8]);
        break;

      case 1: // destroyers
        const d = destroyers[playerId];
        d.unitId = unitId;
        d.playerId = playerId;
        d.mass = parseInt(inputs[3]);
        d.radius = parseInt(inputs[4]);
        d.x = parseInt(inputs[5]);
        d.y = parseInt(inputs[6]);
        d.vx = parseInt(inputs[7]);
        d.vy = parseInt(inputs[8]);
      break;

      case 3: // tankers
        const tanker = new Tanker();
        tanker.unitId = unitId;
        tanker.mass = parseInt(inputs[3]);
        tanker.radius = parseInt(inputs[4]);
        tanker.x = parseInt(inputs[5]);
        tanker.y = parseInt(inputs[6]);
        tanker.vx = parseInt(inputs[7]);
        tanker.vy = parseInt(inputs[8]);
        tanker.water = parseInt(inputs[9]);
        tanker.capacity = parseInt(inputs[10]);

        tankers.push(tanker);
      break;

      case 4: // wrecks
        const wreck = new Wreck();
        wreck.unitId = unitId;
        wreck.radius = parseInt(inputs[4]);
        wreck.x = parseInt(inputs[5]);
        wreck.y = parseInt(inputs[6]);
        wreck.water = parseInt(inputs[9]);

        wrecks.push(wreck);
        break;

      default:
        debug(`unknown unit type ${unitType}`);
    }
  }
}

function step() {
  ++stepNum;
  doPhase();
}

function doPhase() {
  const wreck = getBestWreck(myReaper, wrecks);

  if (wreck) {
    print(`${wreck.x} ${wreck.y} 100`);
  } else {
    print('WAIT');
  }

  print('WAIT');
  print('WAIT');
}

function getBestWreck(myReaper, wrecks) {
  let min = 100500;
  let nearestWreck = null;
  wrecks.forEach(w => {
    const dist = getDistance(myReaper, w);
    if (dist < min) {
      min = dist;
      nearestWreck = w;
    }
  });

  return nearestWreck;
}

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

function getDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(dx * dx + dy * dy);
}
//endregion

if (typeof global === 'undefined' || !global.inTest) {
  initialize();
  gameLoop();
} else {
  module.exports = {
    Reaper,
    Wreck,
    getBestWreck
  };
}
