// #region helpers
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
// #endregion helpers

// #region initialization
const MOLECULES = ['A', 'B', 'C', 'D', 'E'];
const MAX_MOLECULES = 10;
const STAND_BY = ['hey there!', 'on my way', "what's up?"];

let stepNum = 0;

let robots, myRobot, foeRobot, samples, availableMolecules;
let myState = {
  phase: 0,
  waitingForMolecule: 0,
  rankImpact: 0
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

  myRobot.samples.sort((a, b) => b.value - a.value);
}

function robotsShorcut() {
  myRobot = robots[0];
  foeRobot = robots[1];
}

function processSample(sample) {
  const storage = myRobot.storage;
  const expertise = myRobot.expertise;
  sample.costTotal = MOLECULES.reduce(
    (sum, m) => sum + Math.max(sample.cost[m] - expertise[m], 0),
    0
  );
  sample.healthCost =
    sample.costTotal > 0 ? sample.health / sample.costTotal : 100;

  const producible = isSampleProducible(sample, expertise);

  if (!producible) {
    sample.value = 0;
    return sample;
  } else {
    sample.value =
      sample.healthCost + (sample.gain && sample.gain !== '' ? 1 : 0);
  }

  if (isSampleReadyToProduce(sample, storage, expertise)) {
    sample.value += 3;
    sample.readyToProduce = true;
  }

  return sample;
}
// #endregion initialization

function step() {
  ++stepNum;
  doPhase();
}

function doPhase() {
  if (myRobot.eta > 0) {
    print(
      STAND_BY[((new Date().getMilliseconds() / 20) | 0) % STAND_BY.length]
    );
    return;
  }

  let sampleId;
  switch (myState.phase) {
    case 0:
      print('GOTO SAMPLES');
      myState.phase = 1;
      break;

    case 1:
      if (myRobot.samples.length < 3) {
        print(`CONNECT ${getSampleRankToAsk()}`);
      } else {
        myState.phase = 2;
        doPhase();
        return;
      }
      break;

    case 2:
      print('GOTO DIAGNOSIS');
      myState.phase = 3;
      break;

    case 3:
      // first diagnose all the undiagnosed samples
      sampleId = diagnoseSample();
      if (sampleId !== -1) {
        print(`CONNECT ${sampleId}`);
        return;
      }

      sampleId = findNonProducibleSample(myRobot.samples, myRobot.expertise);
      if (sampleId !== -1) {
        print(`CONNECT ${sampleId}`);
        return;
      }

      if (myRobot.samples.length < 2) {
        // get more samples
        myState.phase = 0;
      } else {
        // go to gather molecules
        myState.phase = 4;
      }

      doPhase();
      break;

    case 4:
      print('GOTO MOLECULES');
      myState.phase = 5;
      myState.waitingForMolecule = 0;
      break;

    case 5:
      if (stepNum > 194 && hasSamplesReadyToProduce()) {
        myState.phase = 6;
        doPhase();
        return;
      }

      if (getStorageLeft(myRobot.storage) <= 0) {
        if (hasSamplesReadyToProduce()) {
          myState.phase = 6;
        } else {
          myState.phase = 8;
        }
        doPhase();
        return;
      }

      const requiredMolecule = getRequiredMolecule();
      switch (requiredMolecule) {
        case 'X':
          if (hasSamplesReadyToProduce()) {
            myState.phase = 6;
            doPhase();
            return;
          } else if (
            foeRobot.target === 'LABORATORY' &&
            myState.waitingForMolecule < 4
          ) {
            ++myState.waitingForMolecule;
            print('WAIT');
          } else {
            myState.waitingForMolecule = 0;
            if (myRobot.samples.length < 2) {
              myState.phase = 0;
            } else {
              myState.phase = 8;
            }
            doPhase();
            return;
          }
          break;

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
        const samples = myRobot.samples;

        myState.phase = 0;
        if (samples.length) {
          // ToDo ensure there're molecules for the sample
          const molecule = getRequiredMolecule();
          if (molecule === 'X' || molecule === 'O') {
            // ToDo learn to get best sample from the cloud
            // and then go to upload existing samples first
            myState.phase = 0;
          } else {
            myState.phase = 4;
          }
        }
        doPhase();
        return;
      }
      break;

    case 8:
      print('GOTO DIAGNOSIS');
      myState.phase = 9;
      break;

    case 9:
      if (myRobot.samples.length) {
        print(`CONNECT ${myRobot.samples[0].id}`);
      } else {
        myState.phase = 0;
        doPhase();
      }
      break;
  }

  function hasSamplesReadyToProduce() {
    return getSamplesReadyToProduce().includes(true);
  }
}

function getStorageLeft(storage) {
  return MAX_MOLECULES - sumMolecules(storage);
}

/** counts all molecules in the container */
function sumMolecules(container) {
  return Object.keys(container).reduce((sum, k) => sum + container[k], 0);
}

/** can robot with current expertise produce the sample */
function isSampleProducible(sample, expertise) {
  let totalRequired = 0;
  for (let i = 0; i !== MOLECULES.length; i++) {
    const molecule = MOLECULES[i];
    const moleculeCost = sample.cost[molecule];
    if (moleculeCost === 0) {
      continue;
    }

    const requiredToGatherOfType = Math.max(
      moleculeCost - expertise[molecule],
      0
    );
    if (requiredToGatherOfType > 5) {
      return false;
    }

    totalRequired += requiredToGatherOfType;
  }

  return totalRequired <= MAX_MOLECULES;
}

function isSampleReadyToProduce(sample, storage, expertise) {
  for (let i = 0; i !== MOLECULES.length; i++) {
    const molecule = MOLECULES[i];
    if (sample.cost[molecule] > storage[molecule] + expertise[molecule]) {
      return false;
    }
  }

  return true;
}

const rankSamples = [[1, 1, 1], [2, 1, 1], [2, 2, 2], [3, 2, 2], [3, 3, 3]];
function getSampleRankToAsk() {
  /*
    rank 1 sample costs no more than 5
    rank 2 sample costs no more than 8
    rank 3 sample costs no more than 14
  */
  const q = sumMolecules(myRobot.expertise);
  let rankLevel = 0;
  if (q >= 15) {
    rankLevel = 4;
  } else if (q >= 10) {
    rankLevel = 3;
  } else if (q >= 6) {
    rankLevel = 2;
  } else if (q >= 2) {
    rankLevel = 1;
  }

  rankLevel = Math.max(rankLevel - myState.rankImpact, 0);

  return rankSamples[rankLevel][myRobot.samples.length];
}

function diagnoseSample() {
  const mySamples = myRobot.samples;
  for (let i = 0; i !== mySamples.length; i++) {
    if (mySamples[i].health < 0) {
      return mySamples[i].id;
    }
  }

  return -1;
}

function findNonProducibleSample(samples, expertise) {
  for (let i = 0; i !== samples.length; i++) {
    if (!isSampleProducible(samples[i], expertise)) {
      return samples[i].id;
    }
  }

  return -1;
}

function getSampleToProduce() {
  // ToDo refactore
  // account for the samples that require same molecules
  const ready = getSamplesReadyToProduce();
  for (let i = 0; i !== ready.length; i++) {
    if (!ready[i]) {
      continue;
    }

    return myRobot.samples[i].id;
  }

  return -1;
}

function getSamplesReadyToProduce() {
  const storage = myRobot.storage;
  const expertise = myRobot.expertise;
  return myRobot.samples.map(s =>
    isSampleReadyToProduce(s, storage, expertise)
  );
}

/**
 * returns molecule to get
 * or X if needs more but no molecules available
 * or O if all good
 */
function getRequiredMolecule() {
  const storage = shallowCopy(myRobot.storage);
  const expertise = shallowCopy(myRobot.expertise);

  const mySamples = myRobot.samples;
  let needMore = false;
  const moleculesToTake = [];
  for (let i = 0; i !== mySamples.length; i++) {
    const s = mySamples[i];
    const c = s.cost;
    if (isSampleReadyToProduce(s, storage, expertise)) {
      for (let j = 0; j !== MOLECULES.length; j++) {
        const molecule = MOLECULES[j];
        if (expertise[molecule]) {
          if (expertise[molecule] < c[molecule]) {
            storage[molecule] -= c[molecule] - expertise[molecule];
            expertise[molecule] = 0;
          } else {
            expertise[molecule] -= c[molecule];
          }
        } else {
          storage[molecule] -= c[molecule];
        }
      }
      continue;
    }

    for (let j = 0; j !== MOLECULES.length; j++) {
      const molecule = MOLECULES[j];
      if (storage[molecule] + expertise[molecule] < c[molecule]) {
        if (availableMolecules[molecule]) {
          return molecule;
        } else {
          needMore = true;
        }
      }
    }
  }

  for (let i = 0; i !== moleculesToTake.length; i++) {
    const molecule = moleculesToTake[i];
    if (availableMolecules[molecule] > 0) {
      return molecule;
    }
  }

  return (needMore && 'X') || 'O';
}

if (typeof global === 'undefined' || typeof global.inTest === 'undefined') {
  initialize();
  gameLoop();
} else {
  module.exports = {
    isSampleProducible,
    config: {
      setAvailableMolecules: function(m) {
        availableMolecules = m;
      },
      setSamples: function(s) {
        samples = s;
      },
      setRobots: function(r) {
        robots = r;
        robotsShorcut();
      }
    }
  };
}
