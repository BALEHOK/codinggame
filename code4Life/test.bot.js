const bot = global.bot;

describe('isSampleProducible', () => {
  it('should count storage (positive)', () => {
    const actual = bot.isSampleProducible(
      { cost: { A: 2, B: 5, C: 0, D: 0, E: 0 } },
      { A: 0, B: 0, C: 0, D: 0, E: 0 }
    );
    expect(actual).toBeTruthy();
  });
  it('should account for the correct expertise', () => {
    const actual = bot.isSampleProducible(
      { cost: { A: 2, B: 5, C: 0, D: 5, E: 0 } },
      { A: 0, B: 0, C: 0, D: 2, E: 0 }
    );
    expect(actual).toBeTruthy();
  });
  it('should fail if no correct expertise', () => {
    const actual = bot.isSampleProducible(
      { cost: { A: 2, B: 5, C: 0, D: 5, E: 0 } },
      { A: 0, B: 0, C: 10, D: 0, E: 0 }
    );
    expect(actual).toBeFalsy();
  });
  it('should account for max number of particular molecule', () => {
    const actual = bot.isSampleProducible(
      { cost: { A: 0, B: 0, C: 0, D: 0, E: 6 } },
      { A: 0, B: 0, C: 0, D: 0, E: 0 }
    );
    expect(actual).toBeFalsy();
  });
  it('should account for max number of particular molecule including expertise', () => {
    const actual = bot.isSampleProducible(
      { cost: { A: 0, B: 0, C: 0, D: 0, E: 6 } },
      { A: 0, B: 0, C: 0, D: 0, E: 1 }
    );
    expect(actual).toBeTruthy();
  });
});
