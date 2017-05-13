function debug(message) {
  if (typeof message === 'object') {
    debug(JSON.stringify(message));
    return;
  }

  printErr(message);
}

const molecules = ['A', 'B', 'C', 'D', 'E'];
const MAX_MOLECULES = 10;

let stepNum = 0;

let robots, myRobot, foeRobot, samples;
let myState = {
  phase: 0 // 0 - epmpty, 1 - picked sample
};

// initialization
function initialize() {
  const projectCount = parseInt(readline());
  for (let i = 0; i < projectCount; i++) {
    let inputs = readline().split(' ');
    let a = parseInt(inputs[0]);
    let b = parseInt(inputs[1]);
    let c = parseInt(inputs[2]);
    let d = parseInt(inputs[3]);
    let e = parseInt(inputs[4]);
  }
}

function gameLoop() {
  while (true) {
    resetStepValues();
    readStepValues();
    step();
  }
}

function resetStepValues() {
  robots = [];
  samples = [];
}

function readStepValues() {
  let inputs;
  for (let i = 0; i < 2; i++) {
    const robot = {};

    inputs = readline().split(' ');
    robot.target = inputs[0];
    robot.eta = parseInt(inputs[1]);
    robot.score = parseInt(inputs[2]);

    robot.storage = {
      A: parseInt(inputs[3]),
      B: parseInt(inputs[4]),
      C: parseInt(inputs[5]),
      D: parseInt(inputs[6]),
      E: parseInt(inputs[7])
    };

    robot.expertise = {
      A: parseInt(inputs[8]),
      B: parseInt(inputs[9]),
      C: parseInt(inputs[10]),
      D: parseInt(inputs[11]),
      E: parseInt(inputs[12])
    };

    robot.samples = [];

    robots[i] = robot;
  }

  myRobot = robots[0];
  foeRobot = robots[1];

  inputs = readline().split(' ');
  let availableA = parseInt(inputs[0]);
  let availableB = parseInt(inputs[1]);
  let availableC = parseInt(inputs[2]);
  let availableD = parseInt(inputs[3]);
  let availableE = parseInt(inputs[4]);

  const sampleCount = parseInt(readline());
  for (let i = 0; i < sampleCount; i++) {
    const sample = {};

    inputs = readline().split(' ');
    sample.id = parseInt(inputs[0]);

    const carriedBy = parseInt(inputs[1]);
    sample.carriedBy = carriedBy;
    if (carriedBy !== -1) {
      robots[carriedBy].samples.push(sample);
    }

    sample.rank = parseInt(inputs[2]);
    sample.expertiseGain = inputs[3];
    sample.health = parseInt(inputs[4]);
    sample.cost = {
      A: parseInt(inputs[5]),
      B: parseInt(inputs[6]),
      C: parseInt(inputs[7]),
      D: parseInt(inputs[8]),
      E: parseInt(inputs[9])
    };

    processSample(sample);

    samples.push(sample);
  }
}

function processSample(sample) {
  sample.costTotal = sample.cost.A + sample.cost.B + sample.cost.C + sample.cost.D + sample.cost.E;
  sample.healthCost = sample.health / sample.costTotal;

  return sample;
}

function step() {
  ++stepNum;
  doPhase();
}

function doPhase() {
  let sampleId;
  switch (myState.phase) {
    case 0:
      print('GOTO SAMPLES');
      myState.phase = 1;
      break;

    case 1:
      const rank = myRobot.samples.length + 1;
      print(`CONNECT ${rank}`);
      if (rank === 2) {
        myState.phase = 2;
      }
      break;

    case 2:
      print('GOTO DIAGNOSIS');
      myState.phase = 3;
      break;

    case 3:
      sampleId = diagnoseOrStoreSample(myRobot.samples);
      debug(sampleId);
      if (sampleId !== -1) {
        print(`CONNECT ${sampleId}`);
      } else {
        myState.phase = 4;
        doPhase();
      }
      break;

    case 4:
      print('GOTO MOLECULES');
      myState.phase = 5;
      break;

    case 5:
      const requiredMolecule = getRequiredMolecule(myRobot.samples, myRobot.storage);
      if (requiredMolecule !== 'X') {
        print(`CONNECT ${requiredMolecule}`);
      } else {
        myState.phase = 6;
        doPhase();
      }
      break;

    case 6:
      print('GOTO LABORATORY');
      myState.phase = 7;
      break;

    case 7:
      sampleId = getSampleToProduce();
      if (sampleId !== -1) {
        print(`CONNECT ${sampleId}`);
      } else {
        myState.phase = 0;
        doPhase();
      }
      break;
  }
}

function diagnoseOrStoreSample(samples) {
  for (let i = 0; i !== samples.length; i++) {
    if (samples[i].costTotal < 0) {
      return samples[i].id;
    }
  }

  if (samples.reduce((total, s) => total + s.costTotal, 0) <= MAX_MOLECULES) {
    return -1;
  }

  // robot has 2 samples which need more than 10 molecules
  if (samples[0].health >= samples[1].health) {
    if (samples[0].costTotal <= MAX_MOLECULES) {
      return samples[1].id;
    } else {
      return samples[0].id;
    }
  } else {
    if (samples[1].costTotal <= MAX_MOLECULES) {
      return samples[0].id;
    } else {
      return samples[1].id;
    }
  }
}

function getRequiredMolecule(samples, storage) {
  for (let j = 0; j !== molecules.length; j++) {
    const molecule = molecules[j];
    if (storage[molecule] < samples.reduce(
      (tc, s) => tc + s.cost[molecule], 0)
    ) {
      return molecule;
    }
  }

  return 'X';
}

function getSampleToProduce() {
  return myRobot.samples.length ? myRobot.samples[0].id : -1;
}

if (typeof global === 'undefined' || typeof global.inTest === 'undefined') {
  initialize();
  gameLoop();
} else {
  module.exports = {
    processSample,
    getRequiredMolecule,
    diagnoseOrStoreSample
  };
}
