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

    this.cellsVisited = { ...prevVisitedCells };
    const cellKey = getCellKey(x, y);
    this.cellsVisited[cellKey] = (this.cellsVisited[cellKey] || 0) + 1;

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

let width, height;
const maze = [];
let startX, startY;
let targetX, targetY;
const switchs = {};
const blocks = {};

function getCellKey(x, y) {
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
    const switchKey = getCellKey(switchX, switchY);
    const blockKey = getCellKey(blockX, blockY);
    switchs[switchKey] = blockKey;
    blocks[getCellKey(blockX, blockY)] = initialState;
  }
}

function gameLoop() {
  const successfullPaths = [];
  const initialState = new PathState(
    startX,
    startY,
    { [getCellKey(startX, startY)]: 1 },
    blocks,
    ''
  );
  findNextStep(initialState, successfullPaths);

  successfullPaths.sort((a, b) => a.path.length - b.path.length);

  debug(successfullPaths);

  console.log(successfullPaths[0].path);
}

const directions = ['U', 'D', 'L', 'R'];
function findNextStep(pathState, successfullPaths) {
  directions.forEach(d => {
    const res = checkStep(pathState, d);
    if (res === null) {
      return;
    }

    const { x, y } = res;
    let newBlocks;
    if (maze[x][y] === 's') {
      const switchKey = getCellKey(x, y);
      const blockKey = switchs[switchKey];
      newBlocks = shallowCopy(pathState.blocks);
      newBlocks[blockKey] = !pathState.blocks[blockKey];
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
    !blocks[getCellKey(x, y)]
  );
}

function isInTheLoop(cellsVisited, x, y) {
  const key = getCellKey(x, y);
  return cellsVisited[key] >= 2;
}

if (typeof global === 'undefined' || !global.inTest) {
  initialize();
  gameLoop();
} else {
  module.exports = {
    getCellKey,
    isInTheLoop
  };
}
