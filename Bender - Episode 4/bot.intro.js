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

class PathState {
  constructor(x, y, prevVisitedCells, path) {
    this.x = x;
    this.y = y;
    this.cellsVisited = [...prevVisitedCells, [x, y]];
    this.path = path;
  }
}

class PathCheckResult {
  constructor(result, x, y) {
    this.result = result;
    this.x = x;
    this.y = y;
  }
}

const directions = ['U', 'D', 'L', 'R'];
const path = {
  noWay: 0,
  canGo: 1,
  hitTarget: 2
};

let width, height;
let maze = [];
let startX, startY;
let targetX, targetY;

// initialization
function initialize() {
  /**
   * Auto-generated code below aims at helping you parse
   * the standard input according to the problem statement.
   **/

  var inputs = readline().split(' ');
  width = parseInt(inputs[0]);
  height = parseInt(inputs[1]);
  const lines = [];
  for (let i = 0; i !== height; i++) {
    const line = readline().split('');
    lines.push(line);
  }
  for (let x = 0; x !== width; ++x) {
    maze[x] = [];
    for (let y = 0; y !== height; ++y) {
      maze[x][y] = lines[y][x];
    }
  }

  var inputs = readline().split(' ');
  startX = parseInt(inputs[0]);
  startY = parseInt(inputs[1]);

  var inputs = readline().split(' ');
  targetX = parseInt(inputs[0]);
  targetY = parseInt(inputs[1]);

  // const switchCount = parseInt(readline());
  // for (let i = 0; i < switchCount; i++) {
  //   var inputs = readline().split(' ');
  //   const switchX = parseInt(inputs[0]);
  //   const switchY = parseInt(inputs[1]);
  //   const blockX = parseInt(inputs[2]);
  //   const blockY = parseInt(inputs[3]);
  //   const initialState = parseInt(inputs[4]); // 1 if blocking, 0 otherwise
  // }
}

function gameLoop() {
  const successfullPaths = [];
  const initialState = new PathState(startX, startY, [], '');
  findNextStep(initialState, successfullPaths);

  successfullPaths.sort((a, b) => a.path.length - b.path.length);

  debug(successfullPaths);

  console.log(successfullPaths[0].path);
}

function findNextStep(pathState, successfullPaths) {
  directions.forEach(d => {
    if (isOppositeToLastStep(pathState.path, d)) {
      return;
    }

    const res = checkStep(d, pathState.x, pathState.y);
    if (res === null || isInTheLoop(pathState.cellsVisited, res.x, res.y)) {
      return;
    }

    const newState = new PathState(
      res.x,
      res.y,
      pathState.cellsVisited,
      pathState.path + d
    );

    if (res.result === path.canGo) {
      findNextStep(newState, successfullPaths);
      return;
    }

    successfullPaths.push(newState);
  });
}

// 0 - no way
// 1 - can go
// 2 - hit target
function checkStep(direction, x, y) {
  let newX, newY;
  switch (direction) {
    case 'U':
      newX = x;
      newY = y - 1;
      break;
    case 'D':
      newX = x;
      newY = y + 1;
      break;
    case 'L':
      newX = x - 1;
      newY = y;
      break;
    case 'R':
      newX = x + 1;
      newY = y;
      break;
  }

  if (newX === targetX && newY === targetY) {
    return new PathCheckResult(path.hitTarget, newX, newY);
  }

  return canGoTo(newX, newY)
    ? new PathCheckResult(path.canGo, newX, newY)
    : null;
}

function canGoTo(x, y) {
  return x >= 0 && y >= 0 && x < width && y < height && maze[x][y] === '.';
}

const oppositeDirectionsMap = {
  U: 'D',
  D: 'U',
  L: 'R',
  R: 'L'
};
function isOppositeToLastStep(path, direction) {
  if (path.length === 0) {
    return false;
  }

  return oppositeDirectionsMap[path[path.length - 1]] === direction;
}

function isInTheLoop(cellsVisited, x, y) {
  for (let i = cellsVisited.length - 1; i !== -1; --i) {
    if (cellsVisited[i][0] === x && cellsVisited[i][1] === y) {
      return true;
    }
  }

  return false;
}

if (typeof global === 'undefined' || !global.inTest) {
  initialize();
  gameLoop();
} else {
  module.exports = {};
}
