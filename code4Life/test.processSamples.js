const bot = global.bot;

describe('processSamples', function () {
  const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const availableMolecules = { A: 100, B: 100, C: 100, D: 100, E: 100 };
  let samples;
  function initConfig(){
    bot.config.availableMolecules(availableMolecules);
    bot.config.samples(samples);
    const myRobot = {
      samples: samples.filter(s => s.carriedBy === 0),
      expertise
    };
    bot.config.robots([myRobot]);

    samples.forEach(bot.processSample);

    myRobot.samples.sort((a, b) => b.value - a.value);
  }
  it('removes sample if exceeds molecules num', function () {
    samples = [{
      id: 12,
      cost: { A: 0, B: 1, C: 1, D: 1, E: 1 },
      rank: 1,
      health: 1,
      gain: '',
      carriedBy: 0
    }, {
      id: 13,
      cost: { A: 3, B: 0, C: 0, D: 0, E: 5 },
      rank: 2,
      health: 20,
      gain: '',
      carriedBy: 0
    }];

    initConfig();

    expect(bot.chooseSample()).toBe(-1);
  });

  it('removes sample if can\'t be produced', function () {
    const samples = [{
      id: 12,
      cost: { A: 0, B: 1, C: 1, D: 1, E: 1 },
      rank: 1,
      health: 1,
      gain: '',
      carriedBy: 0
    }, {
      id: 13,
      cost: { A: 3, B: 3, C: 0, D: 0, E: 5 },
      rank: 2,
      health: 20,
      gain: '',
      carriedBy: 0
    }];

    initConfig();

    expect(bot.chooseSample()).toBe(13);

    samples[2].carriedBy = -1;
    initConfig();

    expect(bot.chooseSample()).toBe(-1);
  });
});
