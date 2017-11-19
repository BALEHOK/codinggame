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

}

function readStepValues() {

}

function step() {
  ++stepNum;
  doPhase();
}

function doPhase() {
  // game loop
  while (true) {
    var myScore = parseInt(readline());
    var enemyScore1 = parseInt(readline());
    var enemyScore2 = parseInt(readline());
    var myRage = parseInt(readline());
    var enemyRage1 = parseInt(readline());
    var enemyRage2 = parseInt(readline());
    var unitCount = parseInt(readline());
    for (var i = 0; i < unitCount; i++) {
      var inputs = readline().split(' ');
      var unitId = parseInt(inputs[0]);
      var unitType = parseInt(inputs[1]);
      var player = parseInt(inputs[2]);
      var mass = parseFloat(inputs[3]);
      var radius = parseInt(inputs[4]);
      var x = parseInt(inputs[5]);
      var y = parseInt(inputs[6]);
      var vx = parseInt(inputs[7]);
      var vy = parseInt(inputs[8]);
      var extra = parseInt(inputs[9]);
      var extra2 = parseInt(inputs[10]);
    }

    print('WAIT');
    print('WAIT');
    print('WAIT');
  }
}

if (typeof global === 'undefined' || !global.inTest) {
  initialize();
  gameLoop();
} else {
  module.exports = {

  };
}
