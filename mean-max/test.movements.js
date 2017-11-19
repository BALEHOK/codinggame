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

    const expected = {
      x: 5,
      y: 0,
      throttle: 2.5
    };

    expect(bot.calcThrottle(unit, target)).toEqual(expected);
  });

  it('no initial speed. vertical', () => {
    const unit = new bot.Reaper();
    unit.x = 5;
    unit.y = 0;
    unit.mass = 0.5;

    const target = new bot.Wreck();
    target.x = 5;
    target.y = 10;

    const expected = {
      x: 0,
      y: 10,
      throttle: 5
    };

    expect(bot.calcThrottle(unit, target)).toEqual(expected);
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

    const length = Math.sqrt(29);

    const expected = {
      x: 5,
      y: -2,
      throttle: length * unit.mass
    };

    expect(bot.calcThrottle(unit, target)).toEqual(expected);
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

    const expected = {
      x: -5,
      y: 0,
      throttle: 2.5
    };

    expect(bot.calcThrottle(unit, target)).toEqual(expected);
  });
})
