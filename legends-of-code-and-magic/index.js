// @flow

declare function printErr(string): void;
declare function print(string): void;
declare function readline(): string;

function debug(message) {
  if (typeof message === 'object') {
    debug(JSON.stringify(message));
    return;
  }
  // $FlowFixMe
  printErr(message);
}

// #region lasses
class Abilities {
  b: boolean;
  c: boolean;
  d: boolean;
  g: boolean;
  constructor(abilities: string) {
    this.b = abilities[0] === 'B';
    this.c = abilities[1] === 'C';
    this.d = abilities[2] === 'D';
    this.g = abilities[3] === 'G';
  }
}

const MY_HAND = 0;
const MY_BOARD = 1;
const OPPONENT_BOARD = -1;

type Card = {
  cardNumber: number,
  id: number,
  location: number,
  cardType: number,
  cost: number,
  attack: number,
  defense: number,
  abilities: Abilities,
  myHealthChange: number,
  opponentHealthChange: number,
  cardDraw: number
};

function makeCard(line: string): Card {
  const inputs = line.split(' ');
  const card = {};
  card.cardNumber = parseInt(inputs[0]);
  card.id = parseInt(inputs[1]);
  card.location = parseInt(inputs[2]);
  card.cardType = parseInt(inputs[3]);
  card.cost = parseInt(inputs[4]);
  card.attack = parseInt(inputs[5]);
  card.defense = parseInt(inputs[6]);
  card.abilities = new Abilities(inputs[7]);
  card.myHealthChange = parseInt(inputs[8]);
  card.opponentHealthChange = parseInt(inputs[9]);
  card.cardDraw = parseInt(inputs[10]);

  return card;
}

function cloneCard(card: Card): Card {
  return { ...card };
}
// #endregion classes

// #region game state
// per game
const myDeck: Card[] = [];

// per step
let myMana: number = 0;
let stepNum = 0;
let actions = [];
let myHand: Card[];
let myBoard: Card[];
let opponentBoard: Card[];
let opponentGuards: Card[];
// #endregion game state

function draftPhase() {
  for (let i = 0; i !== 30; ++i) {
    for (let j = 0; j < 2; j++) {
      var inputs = readline().split(' ');
      var playerHealth = parseInt(inputs[0]);
      var playerMana = parseInt(inputs[1]);
      var playerDeck = parseInt(inputs[2]);
      var playerRune = parseInt(inputs[3]);
    }

    var opponentHand = parseInt(readline());
    var cardCount = parseInt(readline());

    const cards = [];
    for (let j = 0; j !== cardCount; j++) {
      const card = makeCard(readline());
      cards.push(card);
    }

    const cardToChoose = chooseCardToDeck(cards, myDeck);
    myDeck.push(cards[cardToChoose]);

    print(`PICK ${cardToChoose}`);
  }
}

let cheapCardsNum = 0;
function chooseCardToDeck(cards, deck) {
  const choosenIndex = cards
    .map((card, i) => ({
      index: i,
      cardType: card.cardType,
      value: calCardValue(card)
    }))
    .filter(card => card.cardType === 0)
    .reduce((q, cardVal) => (cardVal.value > q.value ? cardVal : q), {
      index: 0,
      value: -1
    }).index;

  if (cards[choosenIndex].cost < 5) {
    ++cheapCardsNum;
  }

  return choosenIndex;
}

function calCardValue(card) {
  let k = card.abilities.g ? card.defense : 0;
  if (card.abilities.b && card.attack > 4) {
    k += card.attack;
  }
  return (card.attack + k) / ((1.5 - cheapCardsNum / 20) * card.cost);
}

// game loop
function gameLoop() {
  while (true) {
    ++stepNum;
    actions = [];
    myHand = [];
    myBoard = [];
    opponentBoard = [];
    opponentGuards = [];

    for (let i = 0; i < 2; i++) {
      var inputs = readline().split(' ');
      var playerHealth = parseInt(inputs[0]);
      var playerMana = parseInt(inputs[1]);
      var playerDeck = parseInt(inputs[2]);
      var playerRune = parseInt(inputs[3]);

      if (i === 0) {
        myMana = playerMana;
      }
    }
    var opponentHand = parseInt(readline());
    var cardCount = parseInt(readline());

    for (let j = 0; j < cardCount; j++) {
      const card = makeCard(readline());
      switch (card.location) {
        case MY_HAND:
          myHand.push(card);
          break;

        case MY_BOARD:
          myBoard.push(card);
          break;

        case OPPONENT_BOARD:
          opponentBoard.push(card);
          if (card.abilities.g) {
            opponentGuards.push(cloneCard(card));
          }
      }
    }

    let { summoned, rest: restCardsInHand } = summonGuards(myHand);
    const t = summonAll(restCardsInHand);
    summoned.concat(t.summoned);
    restCardsInHand = t.rest;

    const strikers = summoned.filter(c => c.abilities.c).concat(myBoard);
    attack(strikers.filter(c => !c.abilities.g));
    attack(strikers.filter(c => c.abilities.g));

    if (actions.length) {
      print(actions.join(';'));
    } else {
      print(actionCreators.pass());
    }
  }
}

function summonGuards(cardsOnBoard: Card[]) {
  return summon(c => c.abilities.g && myMana >= c.cost, cardsOnBoard);
}

function summonAll(cardsOnBoard: Card[]) {
  return summon(c => c.cost === 0 || myMana >= c.cost, cardsOnBoard);
}

function summon(
  predicate: Card => boolean,
  cardsOnBoard: Card[]
): { summoned: Card[], rest: Card[] } {
  const summoned = [];
  const rest = [];
  cardsOnBoard.forEach(card => {
    if (predicate(card)) {
      summoned.push(card);
      actions.push(actionCreators.summon(card.id));
      myMana -= card.cost;
    } else {
      rest.push(card);
    }
  });

  return { summoned, rest };
}

function attack(strikers) {
  strikers.forEach(myCard => {
    if (myCard.attack === 0) {
      return;
    }

    if (opponentGuards.length) {
      const guard = opponentGuards[0];
      actions.push(actionCreators.attack(myCard.id, guard.id));
      guard.defense -= myCard.attack;
      if (guard.defense <= 0) {
        opponentGuards.shift();
      }
    } else {
      actions.push(actionCreators.attack(myCard.id));
    }
  });
}

const actionCreators = {
  summon: my => `SUMMON ${my}`,
  attack: (my, opponent = -1) => `ATTACK ${my} ${opponent}`,
  pass: () => 'PASS'
};

if (typeof global === 'undefined' || !global.inTest) {
  draftPhase();
  gameLoop();
} else {
  module.exports = {};
}
