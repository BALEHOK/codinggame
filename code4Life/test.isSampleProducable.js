const bot = global.bot;

describe('isSampleProducible', function () {
  describe('simple cases', function () {
    let storage, expertise, availableMolecules;

    beforeEach(() => {
      storage = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      expertise = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      availableMolecules = { A: 5, B: 5, C: 5, D: 5, E: 5 };
      bot.config.availableMolecules(availableMolecules);
    });

    it('doable sample', function () {
      let sample = {
        cost: { A: 1, B: 1, C: 1, D: 1, E: 1 }
      };

      const producibleRes = bot.isSampleProducible(sample, storage, expertise, bot.getStorageLeft(storage));
      expect(producibleRes.moleculesAvailable).toBeTruthy();
      expect(producibleRes.storageEnough).toBeTruthy();
      expect(producibleRes.producible).toBeTruthy();
    });

    it('not enough molecules available', function () {
      sample = {
        cost: { A: 6, B: 1, C: 1, D: 1, E: 1 }
      };

      const producibleRes = bot.isSampleProducible(sample, storage, expertise, bot.getStorageLeft(storage));
      expect(producibleRes.moleculesAvailable).toBeFalsy();
      expect(producibleRes.storageEnough).toBeTruthy();
      expect(producibleRes.producible).toBeFalsy();
    });

    it('not enough storage available', function () {
      sample = {
        cost: { A: 5, B: 5, C: 5, D: 0, E: 0 }
      };

      const producibleRes = bot.isSampleProducible(sample, storage, expertise, bot.getStorageLeft(storage));
      expect(producibleRes.moleculesAvailable).toBeTruthy();
      expect(producibleRes.storageEnough).toBeFalsy();
      expect(producibleRes.producible).toBeFalsy();
    });

    it('not enough storage available', function () {
      storage = { A: 6, B: 0, C: 1, D: 1, E: 1 };
      expertise = { A: 0, B: 0, C: 0, D: 0, E: 3 };
      availableMolecules = { A: 0, B: 2, C: 1, D: 0, E: 0 };
      bot.config.availableMolecules(availableMolecules);

      sample = {
        cost: { A: 0, B: 2, C: 1, D: 1, E: 1 }
      };

      const producibleRes = bot.isSampleProducible(sample, storage, expertise, bot.getStorageLeft(storage));
      expect(producibleRes.moleculesAvailable).toBeTruthy();
      expect(producibleRes.storageEnough).toBeFalsy();
      expect(producibleRes.producible).toBeFalsy();
    });
  });
});
