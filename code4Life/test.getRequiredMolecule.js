const bot = global.bot;

describe('getRequiredMolecule suite', function () {
  it('removes sample if exceeds molecules num', function () {
    const samples = [{
      id: 22,
      cost: { A: 1, B: 1, C: 0, D: 0, E: 1 },
      rank: 1,
      health: 1
    }, {
      id: 24,
      cost: { A: 1, B: 0, C: 1, D: 0, E: 2 },
      rank: 2,
      health: 30
    }];

    samples.forEach(bot.processSample);
    bot.config.samples(samples);

    bot.config.availableMolecules({ A: 100, B: 100, C: 100, D: 100, E: 100 });

    const storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise }]);

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
    const samples = [{
      id: 22,
      cost: { A: 1, B: 1, C: 0, D: 0, E: 0 },
      rank: 1,
      health: 1
    }];

    samples.forEach(bot.processSample);
    bot.config.samples(samples);

    bot.config.availableMolecules({ A: 0, B: 100, C: 100, D: 100, E: 100 });

    const storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise }]);

    expect(bot.getRequiredMolecule()).toBe('B');
  });

  it('returns X if no molecules available', function () {
    const samples = [{
      id: 22,
      cost: { A: 1, B: 1, C: 0, D: 0, E: 0 },
      rank: 1,
      health: 1
    }];

    samples.forEach(bot.processSample);
    bot.config.samples(samples);

    bot.config.availableMolecules({ A: 0, B: 0, C: 100, D: 100, E: 100 });

    const storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise }]);

    expect(bot.getRequiredMolecule()).toBe('X');
  });

  it('returns O if no molecules required', function () {
    const samples = [{
      id: 22,
      cost: { A: 1, B: 1, C: 0, D: 0, E: 0 },
      rank: 1,
      health: 1
    }];

    samples.forEach(bot.processSample);
    bot.config.samples(samples);

    bot.config.availableMolecules({ A: 0, B: 0, C: 100, D: 100, E: 100 });

    const storage = { A: 1, B: 1, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise }]);

    expect(bot.getRequiredMolecule()).toBe('O');
  });
});