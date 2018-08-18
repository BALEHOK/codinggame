// @flow

function debug(message) {
  if (typeof message === 'object') {
    debug(JSON.stringify(message));
    return;
  }

  printErr(message);
}

const myDeck = [];

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
      const inputs = readline().split(' ');
      const card = {
        cardNumber: parseInt(inputs[0]),
        instanceId: parseInt(inputs[1]),
        location: parseInt(inputs[2]),
        cardType: parseInt(inputs[3]),
        cost: parseInt(inputs[4]),
        attack: parseInt(inputs[5]),
        defense: parseInt(inputs[6]),
        abilities: inputs[7],
        myHealthChange: parseInt(inputs[8]),
        opponentHealthChange: parseInt(inputs[9]),
        cardDraw: parseInt(inputs[10])
      };

      cards.push(card);
    }

    const cardToChoose = chooseCardToDeck(cards, myDeck);
    myDeck.push(cards[cardToChoose]);

    print(`PICK ${cardToChoose}`);
  }
}

function chooseCardToDeck(cards, deck) {
  return cards
    .map((card, i) => ({ index: i, value: card.attack / card.cost }))
    .reduce((q, cardVal) => (cardVal.value > q.value ? cardVal : q), {
      index: -1,
      value: -1
    }).index;
}

// game loop
function gameLoop() {
  while (true) {
    let myMana;
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

    let actions = [];

    for (let j = 0; j < cardCount; j++) {
      var inputs = readline().split(' ');
      var cardNumber = parseInt(inputs[0]);
      var instanceId = parseInt(inputs[1]);
      var location = parseInt(inputs[2]);
      var cardType = parseInt(inputs[3]);
      var cost = parseInt(inputs[4]);
      var attack = parseInt(inputs[5]);
      var defense = parseInt(inputs[6]);
      var abilities = inputs[7];
      var myHealthChange = parseInt(inputs[8]);
      var opponentHealthChange = parseInt(inputs[9]);
      var cardDraw = parseInt(inputs[10]);

      if (location === 0 && cost < myMana) {
        actions.push(`SUMMON ${instanceId}`);
        myMana -= cost;
      } else if (location === 1) {
        actions.push(`ATTACK ${instanceId} -1 yohoho`);
      }
    }

    if (actions.length) {
      print(actions.join(';'));
    } else {
      print('PASS');
    }
  }
}

if (typeof global === 'undefined' || !global.inTest) {
  draftPhase();
  gameLoop();
} else {
  module.exports = {};
}
