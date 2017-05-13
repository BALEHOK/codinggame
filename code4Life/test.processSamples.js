const bot = global.bot;

describe('processSamples suite', function () {
  it('removes sample if exceeds molecules num', function () {
    const samples = [{
      id: 12,
      cost: {
        A: 0,
        B: 1,
        C: 1,
        D: 1,
        E: 1
      },
      rank: 1,
      health: 1
    }, {
      id: 13,
      cost: {
        A: 3,
        B: 0,
        C: 0,
        D: 0,
        E: 5
      },
      rank: 2,
      health: 20
    }];

    samples.forEach(bot.processSample);

    expect(bot.diagnoseOrStoreSample(samples)).toBe(12);
  });
});
