const bot = global.bot;

describe('getRequiredMolecule', function () {
  let availableMolecules, samples, storage;
  let expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  function initConfig(){
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

  it('gets molecules for both samples', function () {
    samples = [{
      id: 22,
      cost: { A: 1, B: 1, C: 0, D: 0, E: 1 },
      rank: 1,
      health: 1,
      gain: '',
      carriedBy: 0
    }, {
      id: 24,
      cost: { A: 1, B: 0, C: 1, D: 0, E: 2 },
      rank: 2,
      health: 30,
      gain: '',
      carriedBy: 0
    }];

    availableMolecules = { A: 100, B: 100, C: 100, D: 100, E: 100 };
    storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    initConfig();

    expect(bot.getRequiredMolecule()).toBe('A');
    ++storage.A;

    expect(bot.getRequiredMolecule()).toBe('A');
    ++storage.A;

    expect(bot.getRequiredMolecule()).toBe('B');
    ++storage.B;

    expect(bot.getRequiredMolecule()).toBe('C');
    ++storage.C;

    expect(bot.getRequiredMolecule()).toBe('E');
    ++storage.E;

    expect(bot.getRequiredMolecule()).toBe('E');
    ++storage.E;

    expect(bot.getRequiredMolecule()).toBe('E');
    ++storage.E;

    expect(bot.getRequiredMolecule()).toBe('O');
  });

  it('gets B if A is not available', function () {
    samples = [{
      id: 22,
      cost: { A: 1, B: 1, C: 0, D: 0, E: 0 },
      rank: 1,
      health: 1,
      gain: '',
      carriedBy: 0
    }];

    samples.forEach(bot.processSample);

    availableMolecules = { A: 0, B: 100, C: 100, D: 100, E: 100 };
    storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    initConfig();

    expect(bot.getRequiredMolecule()).toBe('B');
  });

  it('returns X if no molecules available', function () {
    const samples = [{
      id: 22,
      cost: { A: 1, B: 1, C: 0, D: 0, E: 0 },
      rank: 1,
      health: 1,
      gain: '',
      carriedBy: 0
    }];

    availableMolecules = { A: 0, B: 0, C: 100, D: 100, E: 100 };
    storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    initConfig();

    expect(bot.getRequiredMolecule()).toBe('X');
  });

  it('returns O if no molecules required', function () {
    samples = [{
      id: 22,
      cost: { A: 1, B: 1, C: 0, D: 0, E: 0 },
      rank: 1,
      health: 1,
      gain: '',
      carriedBy: 0
    }];

    availableMolecules = { A: 0, B: 0, C: 100, D: 100, E: 100 };
    storage = { A: 1, B: 1, C: 0, D: 0, E: 0 };
    expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    initConfig();

    expect(bot.getRequiredMolecule()).toBe('O');
  });

  it('does not get more than 10 molecules', function () {
    samples = [{
      id: 5,
      cost: { A: 0, B: 5, C: 3, D: 0, E: 0 },
      rank: 2,
      health: 20,
      gain: '',
      carriedBy: 0
    }];

    availableMolecules = { A: 4, B: 2, C: 4, D: 5, E: 6 };
    storage = { A: 2, B: 4, C: 2, D: 1, E: 0 };
    expertise = { A: 0, B: 1, C: 0, D: 0, E: 0 };

    initConfig();

    expect(bot.getRequiredMolecule()).toBe('C');
    ++storage.C;
    --availableMolecules.C;

    expect(bot.getRequiredMolecule()).toBe('O');
  });
});
