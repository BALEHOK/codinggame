const bot = require('./bot');

describe('get best wreck', () => {
  let myReaper;
  beforeEach(() => {
    myReaper = new bot.Reaper();
    myReaper.x = 500;
    myReaper.y = 800;
  })

  it('should not fail when no wreks', () => {
    expect(bot.getBestWreck([], [])).toBeUndefined();
  });

  it('should choose the nearest one when nothing to avoid`', () => {
    const wrecks = getDefaultWrecks(myReaper);
    const expectedWreck = wrecks[1];

    expect(bot.getBestWreck(wrecks, [])).toBe(expectedWreck);
  });

  it('should choose the less crouded one`', () => {
    const wrecks = getDefaultWrecks(myReaper);
    const nearestWreck = wrecks[1];
    const expectedWreck = wrecks[0];

    const t1 = new bot.Tanker();
    t1.x = nearestWreck.x + nearestWreck.radius;
    t1.y = nearestWreck.y + nearestWreck.radius;
    const t2 = new bot.Tanker();
    t2.x = nearestWreck.x - nearestWreck.radius;
    t2.y = nearestWreck.y - nearestWreck.radius;

    expect(bot.getBestWreck(wrecks, [t1, t2])).toBe(expectedWreck);
  });
});

function getDefaultWrecks(myReaper) {
  const wrecks = [];

  const w1 = new bot.Wreck();
  w1.unitId = 1;
  w1.x = 700;
  w1.y = 1000;
  w1.radius = 100;
  w1.distToMyReaper = bot.getLength(w1, myReaper);
  wrecks.push(w1);

  const w2 = new bot.Wreck();
  w2.unitId = 2;
  w2.x = 300;
  w2.y = 700;
  w2.radius = 100;
  w2.distToMyReaper = bot.getLength(w2, myReaper);
  wrecks.push(w2);

  const w3 = new bot.Wreck();
  w3.unitId = 3;
  w3.x = 600;
  w3.y = 1100;
  w3.radius = 100;
  w3.distToMyReaper = bot.getLength(w3, myReaper);
  wrecks.push(w3);

  return wrecks;
}
