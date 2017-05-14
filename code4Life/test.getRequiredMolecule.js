const bot = global.bot;

describe('getRequiredMolecule suite', function () {
  it('gets molecules for both samples', function () {
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

    bot.config.availableMolecules({ A: 100, B: 100, C: 100, D: 100, E: 100 });

    const storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise, samples }]);

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

    bot.config.availableMolecules({ A: 0, B: 100, C: 100, D: 100, E: 100 });

    const storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise, samples }]);

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

    bot.config.availableMolecules({ A: 0, B: 0, C: 100, D: 100, E: 100 });

    const storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise, samples }]);

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

    bot.config.availableMolecules({ A: 0, B: 0, C: 100, D: 100, E: 100 });

    const storage = { A: 1, B: 1, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise, samples }]);

    expect(bot.getRequiredMolecule()).toBe('O');
  });

  it('does not get more than 10 molecules', function () {
    const samples = [{
      id: 5,
      cost: { A: 0, B: 5, C: 3, D: 0, E: 0 },
      rank: 2,
      health: 20
    }];

    samples.forEach(bot.processSample);

    const availableMolecules = { A: 4, B: 2, C: 4, D: 5, E: 6 };
    bot.config.availableMolecules(availableMolecules);

    const storage = { A: 2, B: 4, C: 2, D: 1, E: 0 };
    const expertise = { A: 0, B: 1, C: 0, D: 0, E: 0 };
    bot.config.robots([{ storage, expertise, samples }]);

    expect(bot.getRequiredMolecule()).toBe('C');
    ++storage.C;
    --availableMolecules.C;

    expect(bot.getRequiredMolecule()).toBe('O');
  });
});
