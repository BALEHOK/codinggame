function predictShipPos(ship, steps) {
  let x, y, dx;
  const speed = ship.speed;
  switch (ship.rotation) {
    case 0:
      x = ship.x + speed * steps;
      y = ship.y;
      break;

    case 1:
      dx = steps + ship.y % 2;

      x = ship.x + speed * (dx >> 1);
      y = ship.y - speed * steps;
      break;

    case 2:
      dx = steps - ship.y % 2 + 1;

      x = ship.x - speed * (dx >> 1);
      y = ship.y - speed * (steps);
      break;

    case 3:
      x = ship.x - speed * steps;
      y = ship.y;
      break;

    case 4:
      dx = steps - ship.y % 2 + 1;

      x = ship.x - speed * (dx >> 1);
      y = ship.y + speed * steps;
      break;

    case 5:
      dx = steps + ship.y % 2;

      x = ship.x + speed * (dx >> 1);
      y = ship.y + speed * steps;
      break;
  }

  return { x, y };
}

describe('predictShipPos suite', function () {
  describe('rotation 1', function () {
    const rotation = 1;
    it('even row', function () {
      let ship = {
        speed: 1,
        rotation: rotation,
        x: 18,
        y: 6
      };
      expect(predictShipPos(ship, 1)).toEqual({ x: 18, y: 5 });
      expect(predictShipPos(ship, 2)).toEqual({ x: 19, y: 4 });
      expect(predictShipPos(ship, 3)).toEqual({ x: 19, y: 3 });
      expect(predictShipPos(ship, 4)).toEqual({ x: 20, y: 2 });
    });
    it('odd row', function () {
      let ship = {
        speed: 1,
        rotation: rotation,
        x: 18,
        y: 7
      };
      expect(predictShipPos(ship, 1)).toEqual({ x: 19, y: 6 });
      expect(predictShipPos(ship, 2)).toEqual({ x: 19, y: 5 });
      expect(predictShipPos(ship, 3)).toEqual({ x: 20, y: 4 });
      expect(predictShipPos(ship, 4)).toEqual({ x: 20, y: 3 });
    });
  });

  describe('rotation 2', function () {
    const rotation = 2;
    it('even row', function () {
      let ship = {
        speed: 1,
        rotation: rotation,
        x: 18,
        y: 6
      };
      expect(predictShipPos(ship, 1)).toEqual({ x: 17, y: 5 });
      expect(predictShipPos(ship, 2)).toEqual({ x: 17, y: 4 });
      expect(predictShipPos(ship, 3)).toEqual({ x: 16, y: 3 });
      expect(predictShipPos(ship, 4)).toEqual({ x: 16, y: 2 });
    });
    it('odd row', function () {
      let ship = {
        speed: 1,
        rotation: rotation,
        x: 18,
        y: 7
      };
      expect(predictShipPos(ship, 1)).toEqual({ x: 18, y: 6 });
      expect(predictShipPos(ship, 2)).toEqual({ x: 17, y: 5 });
      expect(predictShipPos(ship, 3)).toEqual({ x: 17, y: 4 });
      expect(predictShipPos(ship, 4)).toEqual({ x: 16, y: 3 });
    });
  });

  describe('rotation 4', function () {
    const rotation = 4;
    it('even row', function () {
      let ship = {
        speed: 1,
        rotation: rotation,
        x: 18,
        y: 6
      };
      expect(predictShipPos(ship, 1)).toEqual({ x: 17, y: 7 });
      expect(predictShipPos(ship, 2)).toEqual({ x: 17, y: 8 });
      expect(predictShipPos(ship, 3)).toEqual({ x: 16, y: 9 });
      expect(predictShipPos(ship, 4)).toEqual({ x: 16, y: 10 });
    });
    it('odd row', function () {
      let ship = {
        speed: 1,
        rotation: rotation,
        x: 18,
        y: 7
      };
      expect(predictShipPos(ship, 1)).toEqual({ x: 18, y: 8 });
      expect(predictShipPos(ship, 2)).toEqual({ x: 17, y: 9 });
      expect(predictShipPos(ship, 3)).toEqual({ x: 17, y: 10 });
      expect(predictShipPos(ship, 4)).toEqual({ x: 16, y: 11 });
    });
  });

  describe('rotation 5', function () {
    const rotation = 5;
    it('even row', function () {
      let ship = {
        speed: 1,
        rotation: rotation,
        x: 18,
        y: 6
      };
      expect(predictShipPos(ship, 1)).toEqual({ x: 18, y: 7 });
      expect(predictShipPos(ship, 2)).toEqual({ x: 19, y: 8 });
      expect(predictShipPos(ship, 3)).toEqual({ x: 19, y: 9 });
      expect(predictShipPos(ship, 4)).toEqual({ x: 20, y: 10 });
    });
    it('odd row', function () {
      let ship = {
        speed: 1,
        rotation: rotation,
        x: 18,
        y: 7
      };
      expect(predictShipPos(ship, 1)).toEqual({ x: 19, y: 8 });
      expect(predictShipPos(ship, 2)).toEqual({ x: 19, y: 9 });
      expect(predictShipPos(ship, 3)).toEqual({ x: 20, y: 10 });
      expect(predictShipPos(ship, 4)).toEqual({ x: 20, y: 11 });
    });
  });
});