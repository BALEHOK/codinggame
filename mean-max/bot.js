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

class Wreck {
  constructor() {
    this.unitId = 0;
    this.radius = 0;
    this.x = 0;
    this.y = 0;
    this.water = 0;
  }
}

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

let stepNum = 0;

let players, myReaper, en1, en2;
let wrecks;

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
  en1 = new Reaper();
  en2 = new Reaper();
  players = [myReaper, en1, en2];

  wrecks = [];
}

function readStepValues() {
  myReaper.score = parseInt(readline());
  en1.score = parseInt(readline());
  en2.score = parseInt(readline());

  myReaper.rage = parseInt(readline());
  en1.rage = parseInt(readline());
  en2.rage = parseInt(readline());

  const unitCount = parseInt(readline());
  for (let i = 0; i < unitCount; i++) {
    const inputs = readline().split(' ');

    const unitId = parseInt(inputs[0]);
    const unitType = parseInt(inputs[1]);
    const playerId = parseInt(inputs[2]);

    switch (unitType) {
      case 0:
        const r = players[playerId];
        r.unitId = unitId;
        r.playerId = playerId;
        r.mass = parseInt(inputs[3]);
        r.radius = parseInt(inputs[4]);
        r.x = parseInt(inputs[5]);
        r.y = parseInt(inputs[6]);
        r.vx = parseInt(inputs[7]);
        r.vy = parseInt(inputs[8]);
        break;

      case 4:
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

  print(`${wreck.x} ${wreck.y} 100`);
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
function getDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(dx*dx + dy*dy);
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
