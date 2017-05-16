const bot = global.bot;

describe('chooseSample', function () {
  let samples, storage, expertise, availableMolecules;
  function initConfig() {
    bot.config.availableMolecules(availableMolecules);
    bot.config.samples(samples);
    const myRobot = {
      samples: samples.filter(s => s.carriedBy === 0),
      storage,
      expertise
    };
    bot.config.robots([myRobot]);

    samples.forEach(bot.processSample);

    myRobot.samples.sort((a, b) => b.value - a.value);
  }

  it('removes sample if can\'t be produced', function () {
    storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    availableMolecules = { A: 100, B: 100, C: 100, D: 100, E: 100 };

    samples = [{
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

    samples[1].carriedBy = -1;
    initConfig();

    expect(bot.chooseSample()).toBe(-1);
  });
});

describe('processSample', function () {
  let storage, expertise, availableMolecules;
  function initConfig() {
    bot.config.availableMolecules(availableMolecules);
    const myRobot = {
      storage,
      expertise
    };
    bot.config.robots([myRobot]);
  }
  describe('sample value', function () {
    it('sets basic value', function () {
      storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      availableMolecules = { A: 10, B: 10, C: 10, D: 10, E: 10 };

      const sample = {
        id: 12,
        cost: { A: 0, B: 1, C: 1, D: 1, E: 1 },
        rank: 1,
        health: 1,
        gain: '',
        carriedBy: 0
      };

      initConfig();

      expect(bot.processSample(sample).value).toBe(0.25);
    });

    it('set 0 value if can\'t produce', function () {
      storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      availableMolecules = { A: 10, B: 10, C: 10, D: 10, E: 10 };

      const sample = {
        id: 12,
        cost: { A: 10, B: 1, C: 1, D: 1, E: 1 },
        rank: 1,
        health: 1,
        gain: '',
        carriedBy: 0
      };

      initConfig();

      expect(bot.processSample(sample).value).toBe(0);
    });

    it('increases value is sample is ready', function () {
      storage = { A: 0, B: 1, C: 1, D: 1, E: 1 };
      expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      availableMolecules = { A: 0, B: 0, C: 0, D: 0, E: 0 };

      const sample = {
        id: 12,
        cost: { A: 0, B: 1, C: 1, D: 1, E: 1 },
        rank: 1,
        health: 1,
        gain: '',
        carriedBy: 0
      };

      initConfig();

      expect(bot.processSample(sample).value).toBe(7.5);
    });

    it('considers expertise', function () {
      storage = { A: 0, B: 0, C: 1, D: 1, E: 1 };
      expertise = { A: 0, B: 0, C: 0, D: 1, E: 3 };
      availableMolecules = { A: 0, B: 1, C: 1, D: 0, E: 0 };

      const sample = {
        id: 12,
        cost: { A: 0, B: 1, C: 1, D: 1, E: 1 },
        rank: 1,
        health: 1,
        gain: '',
        carriedBy: 0
      };

      initConfig();

      expect(bot.processSample(sample).value).toBe(0.5);
    });

    it('set 0 value if no enough storage left and can\'t produce', function () {
      storage = { A: 6, B: 0, C: 1, D: 1, E: 1 };
      expertise = { A: 0, B: 0, C: 0, D: 0, E: 3 };
      availableMolecules = { A: 0, B: 2, C: 1, D: 0, E: 0 };

      const sample = {
        id: 12,
        cost: { A: 0, B: 2, C: 1, D: 1, E: 1 },
        rank: 1,
        health: 1,
        gain: '',
        carriedBy: 0
      };

      initConfig();

      expect(bot.processSample(sample).value).toBe(0);
    });
  });
});
