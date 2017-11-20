const bot = require('./bot');

describe('calcThrottle', () => {
  it('no initial speed. horizontal', () => {
    const unit = new bot.Reaper();
    unit.x = 5;
    unit.y = 0;
    unit.mass = 0.5;

    const target = new bot.Wreck();
    target.x = 10;
    target.y = 0;

    assertMove(unit, target);
  });

  it('no initial speed. vertical', () => {
    const unit = new bot.Reaper();
    unit.x = 5;
    unit.y = 0;
    unit.mass = 0.5;

    const target = new bot.Wreck();
    target.x = 5;
    target.y = 10;

    assertMove(unit, target);
  });

  it('no initial speed. diagonal', () => {
    const unit = new bot.Reaper();
    unit.x = 5;
    unit.y = 0;
    unit.mass = 0.5;

    const target = new bot.Wreck();
    target.x = 8;
    target.y = 10;

    assertMove(unit, target);
  });

  it('with initial speed', () => {
    const unit = new bot.Reaper();
    unit.x = 5;
    unit.y = 0;
    unit.vx = 0;
    unit.vy = 2;
    unit.mass = 0.5;

    const target = new bot.Wreck();
    target.x = 10;
    target.y = 0;

    assertMove(unit, target);
  });

  it('overspeeding', () => {
    const unit = new bot.Reaper();
    unit.x = 5;
    unit.y = 0;
    unit.vx = 10;
    unit.vy = 0;
    unit.mass = 0.5;

    const target = new bot.Wreck();
    target.x = 10;
    target.y = 0;

    assertMove(unit, target);
  });
});

function assertMove(unit, target) {
  const actualMove = bot.calcThrottle(unit, target);

  const res = moveUnit(unit, actualMove);

  expect(res.x).toEqual(target.x);
  expect(res.y).toEqual(target.y);
}

function moveUnit(unit, move) {
  const distance = bot.getLength(unit, move);
  const coef = (move.throttle / unit.mass) / distance;
  const res = {
    vx: unit.vx + (move.x - unit.x) * coef,
    vy: unit.vy + (move.y - unit.y) * coef
  };

  res.x = unit.x + res.vx;
  res.y = unit.y + res.vy;

  res.vx *= 1 - unit.friction;
  res.vy *= 1 - unit.friction;

  return res;
}
