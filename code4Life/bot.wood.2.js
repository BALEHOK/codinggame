function debug(message) {
  printErr(message);
}

let robots, myRobot, foeRobot, samples;
let myState = {
  phase: 0 // 0 - epmpty, 1 - picked sample
};

// initialization
const projectCount = parseInt(readline());
for (let i = 0; i < projectCount; i++) {
  let inputs = readline().split(' ');
  let a = parseInt(inputs[0]);
  let b = parseInt(inputs[1]);
  let c = parseInt(inputs[2]);
  let d = parseInt(inputs[3]);
  let e = parseInt(inputs[4]);
}

// game loop
while (true) {
  resetStepValues();
  readStepValues();
  step();
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
    robot.storageA = parseInt(inputs[3]);
    robot.storageB = parseInt(inputs[4]);
    robot.storageC = parseInt(inputs[5]);
    robot.storageD = parseInt(inputs[6]);
    robot.storageE = parseInt(inputs[7]);
    robot.expertiseA = parseInt(inputs[8]);
    robot.expertiseB = parseInt(inputs[9]);
    robot.expertiseC = parseInt(inputs[10]);
    robot.expertiseD = parseInt(inputs[11]);
    robot.expertiseE = parseInt(inputs[12]);

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
    sample.costA = parseInt(inputs[5]);
    sample.costB = parseInt(inputs[6]);
    sample.costC = parseInt(inputs[7]);
    sample.costD = parseInt(inputs[8]);
    sample.costE = parseInt(inputs[9]);

    sample.costTotal = sample.costA + sample.costB + sample.costC + sample.costD + sample.costE;
    sample.healthCost = sample.health / sample.costTotal;

    samples.push(sample);
  }

  debug(`my samples: ${myRobot.samples.map(s => s.id).join(',')}`);
  debug(`foe samples: ${foeRobot.samples.map(s => s.id).join(',')}`);
}

function step() {
  switch (myState.phase) {
    case 1:
      const s = samples.find(s => s.carriedBy === -1);
      if (!s) {
        debug('no more samples left');
      }
      print(`CONNECT ${s.id}`);
      myState.phase = 2;
      break;

    case 2:
      print('GOTO MOLECULES');
      myState.phase = 3;
      break;

    case 3:
      const requiredMolecule = getRequiredMolecule();
      if (requiredMolecule) {
        print(`CONNECT ${requiredMolecule}`);
      } else {
        print('GOTO LABORATORY');
        myState.phase = 4;
      }
      break;

    case 4:
      print(`CONNECT ${myRobot.samples[0].id}`);
      myState.phase = 0;
      break;

    default:
      print('GOTO DIAGNOSIS');
      myState.phase = 1;
  }
}

function getRequiredMolecule() {
  const s = myRobot.samples[0];
  if (myRobot.storageA < s.costA) {
    return 'A';
  }
  if (myRobot.storageB < s.costB) {
    return 'B';
  }
  if (myRobot.storageC < s.costC) {
    return 'C';
  }
  if (myRobot.storageD < s.costD) {
    return 'D';
  }
  if (myRobot.storageE < s.costE) {
    return 'E';
  }

  return false;
}
