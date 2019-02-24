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
  constructor(x, y, prevVisitedCells, blocks, path) {
    this.x = x;
    this.y = y;
    this.cellsVisited = [...prevVisitedCells, [x, y]];
    this.blocks = blocks;
    this.path = path;
  }
}

class PathCheckResult {
  constructor(x, y) {
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
const maze = [];
let startX, startY;
let targetX, targetY;
const blocks = {};

function getBlockKey(x, y) {
  return `${x};${y}`;
}

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

  const switchCount = parseInt(readline());
  for (let i = 0; i < switchCount; i++) {
    var inputs = readline().split(' ');
    const switchX = parseInt(inputs[0]);
    const switchY = parseInt(inputs[1]);
    const blockX = parseInt(inputs[2]);
    const blockY = parseInt(inputs[3]);
    const initialState = inputs[4] === '1'; // 1 if blocking, 0 otherwise

    maze[switchX][switchY] = 's';
    blocks[getBlockKey(blockX, blockY)] = initialState;
  }
}

function gameLoop() {
  const successfullPaths = [];
  const initialState = new PathState(startX, startY, [], blocks, '');
  findNextStep(initialState, successfullPaths);

  successfullPaths.sort((a, b) => a.path.length - b.path.length);

  debug(successfullPaths);

  console.log(successfullPaths[0].path);
}

function findNextStep(pathState, successfullPaths) {
  directions.forEach(d => {
    const res = checkStep(pathState, d);
    if (res === null) {
      return;
    }

    const { x, y } = res;
    let newBlocks;
    if (maze[x][y] === 's') {
      const key = getBlockKey(x, y);
      newBlocks = shallowCopy(pathState.blocks);
      newBlocks[key] = !pathState.blocks[key];
    } else {
      newBlocks = pathState.blocks;
    }

    const newState = new PathState(
      res.x,
      res.y,
      pathState.cellsVisited,
      newBlocks,
      pathState.path + d
    );

    if (res.x === targetX && res.y === targetY) {
      successfullPaths.push(newState);
    } else {
      findNextStep(newState, successfullPaths);
    }
  });
}

// 0 - no way
// 1 - can go
// 2 - hit target
function checkStep(pathState, direction) {
  const { x, y } = pathState;

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

  if (
    isOppositeToLastStep(pathState.path, direction) ||
    isInTheLoop(pathState.cellsVisited, newX, newY) ||
    !canGoTo(newX, newY, pathState.blocks)
  ) {
    return null;
  }

  return new PathCheckResult(newX, newY);
}

function canGoTo(x, y, blocks) {
  return (
    x >= 0 &&
    y >= 0 &&
    x < width &&
    y < height &&
    (maze[x][y] === '.' || maze[x][y] === 's') &&
    !blocks[getBlockKey(x, y)]
  );
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
