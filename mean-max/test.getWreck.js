const bot = require('./bot');

describe('get best wreck', () => {
  const myReaper = new bot.Reaper();
  myReaper.x = 5;
  myReaper.y = 8;

  const wrecks = [];

  const w1 = new bot.Wreck();
  w1.x = 7;
  w1.y = 10;
  wrecks.push(w1);

  const w2 = new bot.Wreck();
  w2.x = 3;
  w2.y = 7;
  wrecks.push(w2);

  const w3 = new bot.Wreck();
  w3.x = 6;
  w3.y = 11;
  wrecks.push(w3);

  it('should choose the nearest one', () => {
    expect(bot.getBestWreck(myReaper, wrecks)).toBe(w2);
  })
})
