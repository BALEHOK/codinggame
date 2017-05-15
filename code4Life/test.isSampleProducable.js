const bot = global.bot;

describe('isSampleProducable', function () {
  describe('simple cases', function () {
    const availableMolecules = { A: 5, B: 5, C: 5, D: 5, E: 5 };
    bot.config.availableMolecules(availableMolecules);

    const storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    it('doable sample', function () {
      let sample = {
        cost: { A: 1, B: 1, C: 1, D: 1, E: 1 }
      };
      expect(bot.isSampleProducable(sample, storage, expertise, 10)).toBeTruthy();
    });

    it('not enough molecules available', function () {
      sample = {
        cost: { A: 6, B: 1, C: 1, D: 1, E: 1 }
      };
      expect(bot.isSampleProducable(sample, storage, expertise, 10)).toBeFalsy();
    });

    it('not enough storage available', function () {
      sample = {
        cost: { A: 5, B: 5, C: 5, D: 0, E: 0 }
      };
      expect(bot.isSampleProducable(sample, storage, expertise, 10)).toBeFalsy();
    });
  });
});
