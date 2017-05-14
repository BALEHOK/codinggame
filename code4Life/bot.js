function debug(message) {
  if (typeof message === 'object') {
    debug(JSON.stringify(message));
    return;
  }

  printErr(message);
}

const MOLECULES = ['A', 'B', 'C', 'D', 'E'];
const MAX_MOLECULES = 10;
const STAND_BY = [
  'hey there!',
  'on my way',
  'what\'s up?'
]

let stepNum = 0;

let robots, myRobot, foeRobot, samples, availableMolecules;
let myState = {
  phase: 0, // 0 - epmpty, 1 - picked sample
  waitingForMolecule: 0
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

  robotsShorcut();

  inputs = readline().split(' ');
  availableMolecules = {
    A: parseInt(inputs[0]),
    B: parseInt(inputs[1]),
    C: parseInt(inputs[2]),
    D: parseInt(inputs[3]),
    E: parseInt(inputs[4])
  };

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
    sample.gain = inputs[3];
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

function robotsShorcut() {
  myRobot = robots[0];
  foeRobot = robots[1];
}

function processSample(sample) {
  const expertise = myRobot.expertise;
  sample.costTotal = MOLECULES.reduce((sum, m) => sample.cost[m] - expertise[m], 0);
  sample.healthCost = sample.health / sample.costTotal;

  const canProduce = sample.costTotal <= MAX_MOLECULES;
  if (!canProduce) {
    sample.value = 0;
  } else {
    sample.value = sample.healthCost + sample.gain;
  }

  return sample;
}

function step() {
  ++stepNum;
  doPhase();
}

function doPhase() {
  if (myRobot.eta > 0) {
    print(STAND_BY[(((new Date()).getMilliseconds() / 20) | 0) % STAND_BY.length]);
    return;
  }

  let sampleId;
  switch (myState.phase) {
    case 0:
      print('GOTO SAMPLES');
      myState.phase = 1;
      break;

    case 1:
      const rank = myRobot.samples.length + 1;
      print(`CONNECT ${rank}`);
      if (rank === 3) {
        myState.phase = 2;
      }
      break;

    case 2:
      print('GOTO DIAGNOSIS');
      myState.phase = 3;
      break;

    case 3:
      sampleId = diagnoseSample();
      if (sampleId !== -1) {
        print(`CONNECT ${sampleId}`);
        return;
      }

      sampleId = chooseSample();
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
      const requiredMolecule = getRequiredMolecule();
      switch (requiredMolecule) {
        case 'X':
          if (!canProduceSample()) {
            print('WAIT');
            break;
          }

        case 'O':
          myState.phase = 6;
          doPhase();
          break;

        default:
          print(`CONNECT ${requiredMolecule}`);
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

function diagnoseSample() {
  const mySamples = myRobot.samples;
  for (let i = 0; i !== mySamples.length; i++) {
    if (mySamples[i].costTotal < 0) {
      return mySamples[i].id;
    }
  }

  return -1;
}

function chooseSample() {
  const expertise = myRobot.expertise;
  const availableSamples = samples.filter(s => s.carriedBy !== 1);
  availableSamples.sort((a, b) => b.value - a.value);

  let choosenSamplesCount = 0;
  for (let i = 0; i !== availableSamples.length && choosenSamplesCount < 3; i++) {
    let choosenSample = availableSamples[i];
    if (choosenSample.carriedBy === 0) {
      ++choosenSamplesCount;
      continue;
    }

    const mySamples = myRobot.samples;
    if (mySamples.length < 3) {
      return choosenSample.id;
    }

    const worstCarriedSample = myRobot.samples.reduce(
      (min, cur) => min.value < cur.value ? min : cur
    );

    return worstCarriedSample.id;
  }

  return -1;
}

function getRequiredMolecule() {
  const storage = myRobot.storage;
  const expertise = myRobot.expertise;

  // ToDo refactor this check
  if (Object.keys(storage).reduce((sum, k) => sum + storage[k], 0) === MAX_MOLECULES) {
    return 'O';
  }

  let needMore = false;
  for (let j = 0; j !== MOLECULES.length; j++) {
    const molecule = MOLECULES[j];
    const moleculesRequired = myRobot.samples.reduce((tc, s) => tc + s.cost[molecule], 0);
    if (storage[molecule] + expertise[molecule] < moleculesRequired) {
      if (availableMolecules[molecule]) {
        return molecule;
      } else {
        needMore = true;
      }
    }
  }

  return needMore && 'X' || 'O';
}

function canProduceSample() {
  debug(samplesReadyToProduce());
  return samplesReadyToProduce().includes(true);
}

function samplesReadyToProduce() {
  const storage = myRobot.storage;
  const expertise = myRobot.expertise;

  return myRobot.samples.map(s => {
    for (let i = 0; i !== MOLECULES.length; i++) {
      const molecule = MOLECULES[i];
      if (s.cost[molecule] > storage[molecule] + expertise[molecule]) {
        return false;
      }
    }

    return true;
  });
}

function getSampleToProduce() {
  const ready = samplesReadyToProduce();
  for (let i = 0; i !== ready.length; i++) {
    if (!ready[i]) {
      continue;
    }

    return myRobot.samples[i].id;
  }

  return -1;
}

if (typeof global === 'undefined' || typeof global.inTest === 'undefined') {
  initialize();
  gameLoop();
} else {
  module.exports = {
    processSample,
    getRequiredMolecule,
    diagnoseOrStoreSample,
    config: {
      availableMolecules: function (m) {
        availableMolecules = m;
      },
      samples: function (s) {
        samples = s;
      },
      robots: function (r) {
        robots = r;
        robotsShorcut();
      }
    }
  };
}
