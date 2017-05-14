function debug(message) {
  if (typeof message === 'object') {
    debug(JSON.stringify(message));
    return;
  }

  printErr(message);
}

// initialization
const init = [];
function initialize() {
  init[0] = parseInt(readline());
  init[1] = parseInt(readline());
  init[2] = parseInt(readline());
}

function gameLoop() {
  while (true) {
    resetStepValues();
    readStepValues();
    step();
  }
}

let stepNum = 0;
let chars, ints1, ints2;
function resetStepValues() {
  chars = [];
  ints1 = [];
  ints2 = [];
}

function readStepValues() {
  chars[0] = readline();
  chars[1] = readline();
  chars[2] = readline();
  chars[3] = readline();

  let inputs1 = readline().split(' ');
  ints1[0] = parseInt(inputs1[0]);
  ints1[1] = parseInt(inputs1[1]);

  let inputs2 = readline().split(' ');
  ints2[0] = parseInt(inputs2[0]);
  ints2[1] = parseInt(inputs2[1]);
}

function step() {
  ++stepNum;
  print('A');
}

if (typeof global === 'undefined' || typeof global.inTest === 'undefined') {
  initialize();
  gameLoop();
} else {
  module.exports = {

  };
}
