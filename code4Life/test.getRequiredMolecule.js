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

    const storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    expect(bot.getRequiredMolecule(samples, storage)).toBe('A');
    ++storage.A;

    expect(bot.getRequiredMolecule(samples, storage)).toBe('A');
    ++storage.A;

    expect(bot.getRequiredMolecule(samples, storage)).toBe('B');
    ++storage.B;

    expect(bot.getRequiredMolecule(samples, storage)).toBe('C');
    ++storage.C;

    expect(bot.getRequiredMolecule(samples, storage)).toBe('E');
    ++storage.E;

    expect(bot.getRequiredMolecule(samples, storage)).toBe('E');
    ++storage.E;

    expect(bot.getRequiredMolecule(samples, storage)).toBe('E');
    ++storage.E;

    expect(bot.getRequiredMolecule(samples, storage)).toBe('X');
  });
});
