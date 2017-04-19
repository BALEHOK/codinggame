function debug(message) {
  printErr(message);
}

function IdMap() {
  this.length = 0;
  this.values = [];

  this.push = function (v) {
    this[v.id] = v;
    this.values.push(v);
    this.length++;
  };

  this.delete = function (id) {
    this[id] = null;
    const index = this.values.findIndex(v => v.id === id);
    this.values.splice(index, 1);
    this.length--;
  }
}

// region actions
function Actions() {
  this.bestScore = 0;

  this.push = function (action) {
    const k = action.k;
    this[k] = action;
    if (k > this.bestScore) {
      this.bestScore = k;
    }
  };
  this.getBest = function () {
    debug('best score: ' + this.bestScore + '; ' + this[this.bestScore]);
    return this[this.bestScore];
  };

  this.push(new Wait(0));
}

function Move(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
  this.type = 'MOVE';

  this.toString = function () {
    return `${this.type} ${this.x} ${this.y}`;
  }
}
function Fire(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
  this.type = 'FIRE';

  this.toString = function () {
    return `${this.type} ${this.x} ${this.y}`;
  }
}
function Wait(k) {
  this.k = k;
  this.type = 'WAIT';
  this.toString = function () {
    return this.type;
  }
}
function Mine(k) {
  this.k = k;
  this.type = 'MINE';
  this.toString = function () {
    return this.type;
  }
}
function Slower(k) {
  this.k = k;
  this.type = 'SLOWER';
  this.toString = function () {
    return this.type;
  }
}
// endregion actions

// consts
const minesDelay = 4;
const fireDelay = 1;

let stepNum = 0;

let myShips;
let fowShips;
let barrels;
let cannonballs;
let mines;

// game loop
while (true) {
  resetStepValues();
  readStepValues();
  step();
}

function resetStepValues() {
  fowShips = [];
  barrels = [];
  cannonballs = [];
  mines = [];
}

function readStepValues() {
  const myShipCount = parseInt(readline()); // the number of remaining ships
  const entityCount = parseInt(readline()); // the number of entities (e.g. ships, mines or cannonballs)
  const myShipsAlive = [];

  for (let i = 0; i < entityCount; i++) {
    const inputs = readline().split(' ');
    const entityId = parseInt(inputs[0]);
    const entityType = inputs[1];
    const x = parseInt(inputs[2]);
    const y = parseInt(inputs[3]);
    const arg1 = parseInt(inputs[4]);
    const arg2 = parseInt(inputs[5]);
    const arg3 = parseInt(inputs[6]);
    const arg4 = parseInt(inputs[7]);

    switch (entityType) {
      case 'SHIP':
        if (arg4 === 1) { // arg4 === 1 ? my ship : enemy
          myShipsAlive.push(entityId);

          const ship = getMyShip(entityId);
          Object.assign(ship, {
            x, y,
            rotation: arg1,
            speed: arg2, // 0 <= speed <= 2
            rum: arg3
          });
        } else {
          fowShips.push({
            id: entityId,
            x, y,
            rotation: arg1,
            speed: arg2, // 0 <= speed <= 2
            rum: arg3
          });
        }
        break;

      case 'BARREL':
        barrels.push({
          id: entityId,
          x, y,
          rum: arg1
        });
        break;

      case 'CANNONBALL':
        cannonballs.push({
          id: entityId,
          x, y,
          firedBy: arg1, // the entityId of the ship that fired this cannon ball
          impactIn: arg2 // the number of turns before impact (1 means the cannon ball will land at the end of the current turn)
        })

      case 'MINE':
        mines.push({
          x, y
        });
      default:
        break;
    }

    for (let i = 0; i < myShips.length;) {
      let s = myShips.values[i];
      if (myShipsAlive.indexOf(s.id) === -1) {
        myShips.delete(s.id);
      } else {
        ++i;
      }
    }
  }

  function getMyShip(id) {
    if (!myShips) {
      myShips = new IdMap();
    }

    let ship = myShips[id];

    if (!ship) {
      ship = {
        id,
        mineStep: -minesDelay,
        fireStep: -fireDelay,
        movingTo: null
      }
      myShips.push(ship);
    }

    return ship;
  }
}

function kMove(d) { return 10 / d; }
function kMine() { return 1; }
function kRunAway() { return 2; }
function kFireInMine(d) {
  switch (d) {
    case 3:
      return 6;
    case 4:
      return 2;
    case 5:
      return 1;
    default:
      return 0;
  }
}
function kFire(steps, targetSpeed) {
  return 50 / (steps * steps * (1 + 2 * targetSpeed));
}
function step() {
  ++stepNum;

  const allShipsActions = [];

  for (let i = 0; i !== myShips.length; i++) {
    const s = myShips.values[i];
    const moveActions = new Actions();
    const actions = new Actions();

    // land a mine
    // if (stepNum - s.mineStep > minesDelay) {
    //   actions.push(kMine(), new Mine());
    // }

    // collect barrels
    for (let j = 0; j !== barrels.length; j++) {
      const b = barrels[j];
      const dist = getDistance(s, b);
      const k = kMove(dist);
      moveActions.push(new Move(k, b.x, b.y));
    }

    // run away from cannonball if no barrels left
    if (!barrels.length && cannonballs.length) {
      if (s.x <= 4 && s.y > 4) {
        moveActions.push(new Move(kRunAway(), 4, 4));
      } else if (s.y <= 4 && s.x < 18) {
        moveActions.push(new Move(kRunAway(), 18, 4));
      } else if (s.x >= 18 && s.y < 16) {
        moveActions.push(new Move(kRunAway(), 18, 16));
      } else if (s.y >= 16 && s.x > 4) {
        moveActions.push(new Move(kRunAway(), 4, 16));
      } else if (s.speed === 0) {
        moveActions.push(new Move(kRunAway(), 4, 4));
      }
    }

    // fire in mine
    // for (let j = 0; j !== mines.length; j++) {
    //   const m = mines[j];
    //   const dist = getDistance(s, m);
    //   if (dist > 2 && dist < 5) {
    //     const k = kFireInMine(dist);
    //     debug(`fire in mine ${m.x} ${m.y}, ${k}, ship ${i}`);
    //     actions.push(new Fire(k, m.x, m.y));
    //   }
    // }

    // fire
    if (stepNum - s.fireStep > fireDelay) {
      for (let j = 0; j !== fowShips.length; j++) {
        const f = fowShips[j];
        let dist = getDistance(s, f);
        const steps = getCannonSteps(dist);
        const speed = f.speed;
        const k = kFire(steps, speed);
        if (speed === 0) {
          actions.push(new Fire(k, f.x, f.y));
        } else {
          let target = predictShipPos(f, steps);
          dist = getDistance(s, target);
          const newSteps = getCannonSteps(dist);
          if (newSteps !== steps) {
            target = predictShipPos(f, newSteps);
          }

          // debug(`fire. ship: {${f.x}, ${f.y}}, speed: ${speed}, rot: ${f.rotation}`);
          // debug(`steps: ${newSteps}, target: {${target.x}, ${target.y}}`);

          if (target.x >= 0 && target.x <= 22
            && target.y >= 0 && target.y <= 20) {
            actions.push(new Fire(k, target.x, target.y));
          }
        }
      }
    }

    allShipsActions.push({
      actions, moveActions
    });
  }

  for (let i = 0; i !== allShipsActions.length; i++) {
    const s = myShips.values[i];

    s.prevX = s.x;
    s.prevY = s.y;

    const moveAction = allShipsActions[i].moveActions.getBest();
    const action = allShipsActions[i].actions.getBest();

    if (action.k > moveAction.k) {
      // || (s.movingTo && s.movingTo.x === moveAction.x && s.movingTo.y === moveAction.y)) {
      if (action.type === 'FIRE') {
        s.fireStep = stepNum;
      } else if (action.type === 'MINE') {
        s.mineStep = stepNum;
      }

      print(action.toString());
    } else {
      s.movingTo = { x: moveAction.x, y: moveAction.y };
      print(moveAction.toString());
    }
  }
}

function getCannonSteps(dist) {
  return Math.ceil((1 + dist) / 3) + 1;
}
function predictShipPos(ship, steps) {
  let x, y, dx;
  const speed = ship.speed;
  switch (ship.rotation) {
    case 0:
      x = ship.x + speed * steps;
      y = ship.y;
      break;

    case 1:
      dx = steps + ship.y % 2;

      x = ship.x + speed * (dx >> 1);
      y = ship.y - speed * steps;
      break;

    case 2:
      dx = steps - ship.y % 2 + 1;

      x = ship.x - speed * (dx >> 1);
      y = ship.y - speed * (steps);
      break;

    case 3:
      x = ship.x - speed * steps;
      y = ship.y;
      break;

    case 4:
      dx = steps - ship.y % 2 + 1;

      x = ship.x - speed * (dx >> 1);
      y = ship.y + speed * steps;
      break;

    case 5:
      dx = steps + ship.y % 2;

      x = ship.x + speed * (dx >> 1);
      y = ship.y + speed * steps;
      break;
  }

  return { x, y };
}

// utils
function Hex(q, r, s) {
  return { q, r, s };
}
function hex_add(a, b) {
  return Hex(a.q + b.q, a.r + b.r, a.s + b.s);
}
function hex_subtract(a, b) {
  return Hex(a.q - b.q, a.r - b.r, a.s - b.s);
}
function hex_length(hex) {
  return Math.trunc((Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) >> 1);
}
function hex_distance(a, b) {
  return hex_length(hex_subtract(a, b));
}

function offset_to_cube({ x, y }) {
  let h = { col: x, row: y };
  var q = h.col - Math.trunc((h.row - (h.row & 1)) >> 1);
  var r = h.row;
  var s = -q - r;
  return Hex(q, r, s);
}
function roffset_from_cube(h) {
  var x = h.q + Math.trunc((h.r - (h.r & 1)) >> 1);
  var y = h.r;
  return { x, y };
}

function getDistance(a, b) {
  const ac = offset_to_cube(a);
  const bc = offset_to_cube(b);

  return hex_distance(ac, bc);
}

function shortestWay(a, b) {

}

/*
function cube_reachable(start, movement):
    var visited = set()
add start to visited
var fringes = []
fringes.append([start])

for each 1 < k ≤ movement:
fringes.append([])
for each cube in fringes[k - 1]:
  for each 0 ≤ dir < 6:
var neighbor = cube_neighbor(cube, dir)
if neighbor not in visited, not blocked:
add neighbor to visited
fringes[k].append(neighbor)

return visited
*/

/* ToDo
- если рома больше 90, уменьшить к
- не бежать к одной бочке двумя ботами
- сменить мув, если стоит на месте больше 2х ходов
- обходить мины
- стрелять в мины
- переделать движение, и если не надо менять направление, выбирать не мув экшен
- делать самому расчет пути (обходить мины и снаряды, стрелять, не меняя движения и т.д.)
- добивать оставшиеся корабли
*/