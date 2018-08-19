//      

                                        
                                     
                                    

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
             
             
             
  constructor(abilities        ) {
    this.b = abilities[0] === 'B';
    this.c = abilities[1] === 'C';
    this.g = abilities[3] === 'G';
  }
}

const MY_HAND = 0;
const MY_BOARD = 1;
const OPPONENT_BOARD = -1;

             
                     
             
                   
                   
               
                 
                  
                       
                         
                               
                  
  

function makeCard(line        )       {
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

function cloneCard(card      )       {
  return { ...card };
}
// #endregion classes

// #region game state
// per game
const myDeck         = [];

// per step
let myMana         = 0;
let stepNum = 0;
let actions = [];
let myHand        ;
let myBoard        ;
let opponentBoard        ;
let opponentGuards        ;
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

    let restCardsInHand = summonFree(myHand);
    restCardsInHand = summonGuards(restCardsInHand);
    restCardsInHand = summon(restCardsInHand);

    myBoard.forEach(myCard => {
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

    if (actions.length) {
      print(actions.join(';'));
    } else {
      print(actionCreators.pass());
    }
  }
}

function summonFree(cardsOnBoard        )         {
  const restCards = [];
  cardsOnBoard.forEach(card => {
    if (card.cost === 0) {
      actions.push(actionCreators.summon(card.id));
    } else {
      restCards.push(card);
    }
  });

  return restCards;
}

function summonGuards(cardsOnBoard        )         {
  const restCards = [];
  cardsOnBoard.forEach(card => {
    if (card.abilities.g && myMana >= card.cost) {
      actions.push(actionCreators.summon(card.id));
      myMana -= card.cost;
    } else {
      restCards.push(card);
    }
  });

  return restCards;
}

function summon(cardsOnBoard        )         {
  if (myMana <= 0) {
    return cardsOnBoard;
  }

  const restCards = [];
  cardsOnBoard.forEach(card => {
    if (myMana >= card.cost) {
      actions.push(actionCreators.summon(card.id));
      myMana -= card.cost;
    } else {
      restCards.push(card);
    }
  });

  return restCards;
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
