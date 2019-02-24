const bot = global.bot;

function mapCells(array) {
  return array.reduce((acc, cur) => {
    const cellKey = bot.getCellKey(cur[0], cur[1]);
    const value = acc[cellKey] || 0;
    acc[cellKey] = value + 1;
    return acc;
  }, {});
}

describe('isInTheLoop', () => {
  it('clean story', () => {
    const cellsVisited = mapCells([]);
    const actual = bot.isInTheLoop(cellsVisited, 0, 0);
    const expected = false;
    expect(actual).toBe(expected);
  });

  it('no loop story', () => {
    const cellsVisited = mapCells([[0, 0], [1, 0]]);
    const actual = bot.isInTheLoop(cellsVisited, 0, 0);
    const expected = false;
    expect(actual).toBe(expected);
  });

  it('loop', () => {
    const cellsVisited = mapCells([[0, 0], [1, 0], [0, 0], [1, 0]]);
    const actual = bot.isInTheLoop(cellsVisited, 0, 0);
    const expected = true;
    expect(actual).toBe(expected);
  });
});
