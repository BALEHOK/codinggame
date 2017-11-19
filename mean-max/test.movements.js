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
      x: 10,
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
      x: 5,
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

    const expected = {
      x: 10,
      y: 0,
      throttle: Math.sqrt(29)*unit.mass
    };

    expect(bot.calcThrottle(unit, target)).toEqual(expected);
  });
})
