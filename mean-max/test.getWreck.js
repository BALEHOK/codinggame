const bot = require('./bot');

describe('get best wreck', () => {
  let myReaper;
  let wrecks;
  let entitiesToAvoid;
  beforeEach(() => {
    myReaper = new bot.Reaper();
    myReaper.x = 5;
    myReaper.y = 8;

    wrecks = [];
    entitiesToAvoid = [];
  })

  it('should not fail when no wreks', () => {
    expect(bot.getBestWreck(wrecks, entitiesToAvoid)).toBeUndefined();
  });

  it('should choose the nearest one when nothing to avoid`', () => {
    const w1 = new bot.Wreck();
    w1.unitId = 1;
    w1.x = 7;
    w1.y = 10;
    w1.distToMyReaper = bot.getLength(w1, myReaper);
    wrecks.push(w1);

    const w2 = new bot.Wreck();
    w2.unitId = 2;
    w2.x = 3;
    w2.y = 7;
    w2.distToMyReaper = bot.getLength(w2, myReaper);
    wrecks.push(w2);

    const w3 = new bot.Wreck();
    w3.unitId = 3;
    w3.x = 6;
    w3.y = 11;
    w3.distToMyReaper = bot.getLength(w3, myReaper);
    wrecks.push(w3);

    expect(bot.getBestWreck(wrecks, entitiesToAvoid)).toBe(w2);
  })
})
