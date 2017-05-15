const bot = global.bot;

describe('processSamples', function () {
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

  it('doesn\'t hang with the same sample', function () {
    storage = { A: 0, B: 0, C: 0, D: 2, E: 2 };
    expertise = { A: 4, B: 1, C: 1, D: 1, E: 1 };
    availableMolecules = { A: 100, B: 100, C: 100, D: 100, E: 100 };

    samples = [
      {
        "id": 4,
        "carriedBy": 0,
        "rank": 3,
        "gain": "E",
        "health": 50,
        "cost": {
          "A": 0,
          "B": 0,
          "C": 0,
          "D": 7,
          "E": 3
        },
        "costTotal": 2,
        "healthCost": 25,
        "value": 26
      },
      {
        "id": 17,
        "carriedBy": 0,
        "rank": 3,
        "gain": "B",
        "health": 30,
        "cost": {
          "A": 3,
          "B": 0,
          "C": 3,
          "D": 3,
          "E": 5
        },
        "costTotal": 6,
        "healthCost": 5,
        "value": 6
      },
      {
        "id": 20,
        "carriedBy": 0,
        "rank": 2,
        "gain": "B",
        "health": 30,
        "cost": {
          "A": 0,
          "B": 6,
          "C": 0,
          "D": 0,
          "E": 0
        },
        "costTotal": -2,
        "healthCost": -15,
        "value": -14
      },
      {
        "id": 15,
        "carriedBy": 1,
        "rank": 3,
        "gain": "B",
        "health": 40,
        "cost": {
          "A": 7,
          "B": 0,
          "C": 0,
          "D": 0,
          "E": 0
        },
        "costTotal": -1,
        "healthCost": -40,
        "value": -39
      },
      {
        "id": 18,
        "carriedBy": 1,
        "rank": 2,
        "gain": "D",
        "health": 30,
        "cost": {
          "A": 0,
          "B": 0,
          "C": 0,
          "D": 6,
          "E": 0
        },
        "costTotal": -2,
        "healthCost": -15,
        "value": -14
      }
    ];

    initConfig();

    expect(bot.chooseSample()).toBe(13);

    samples[1].carriedBy = -1;
    initConfig();

    expect(bot.chooseSample()).toBe(-1);
  });
});
