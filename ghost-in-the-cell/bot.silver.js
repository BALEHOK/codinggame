// printErr('Debug messages...');

// CONSTS
var maxDist = 20;

var minCyborgsAtFactory = 0;
var bombsCount = 2;
var bombTarget;
var factoryCount = parseInt(readline()); // the number of factories
var linkCount = parseInt(readline()); // the number of links between factories

var turnNum = 0;
var moves;

var factories = {};
var myFactories = [];

var troops = [];
var bombs = [];

for (var i = 0; i < linkCount; i++) {
    var inputs = readline().split(' ');
    var factory1Id = parseInt(inputs[0]);
    var factory2Id = parseInt(inputs[1]);
    var distance = parseInt(inputs[2]);

    addDistance(factory1Id, factory2Id, distance);
    printErr('dist ' + factory1Id + ' ' + factory2Id + ': ' + distance);
    addDistance(factory2Id, factory1Id, distance);
}

// game loop
while (true) {
    turn()
}

function addDistance(factory1Id, factory2Id, distance) {
    var f1 = getOrInitFactory(factory1Id);
    (f1.distances[distance] || (f1.distances[distance] = [])).push(factory2Id);
    f1.distancesF[factory2Id] = distance;
}

function getOrInitFactory(factoryId) {
    var factory = factories[factoryId];
    if (!factory) {
        factory = {
            id: factoryId,
            distances: [],
            distancesF: {}
            // owner: null,
            // cyborgsCount: null,
            // production: null,
        };
        factories[factoryId] = factory;
    }
    return factory;
}

var turnRoutes,
    myFactoryIndex;
function initTurn() {
    ++turnNum;
    moves = [];
    troops = [];
    bombs = [];
    turnRoutes = [];
    myFactories = [];

    myFactoryIndex = 0;

    bombSource = -1;
}

function turn() {
    initTurn();

    // if (turnNum > 30) {
    //     minCyborgsAtFactory = 5;
    // }

    var entityCount = parseInt(readline()); // the number of entities (e.g. factories and troops)
    for (var i = 0; i < entityCount; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]);
        var entityType = inputs[1];

        if (entityType === 'FACTORY') {
            var f = factories[entityId];
            f.owner = parseInt(inputs[2]);
            f.cyborgsCount = parseInt(inputs[3]);
            f.production = parseInt(inputs[4]);

            myFactories.push(f.id);
        } else if (entityType === 'TROOP') {
            troops.push({
                owner: parseInt(inputs[2]),
                source: parseInt(inputs[3]),
                target: parseInt(inputs[4]),
                cyborgsCount: parseInt(inputs[5]),
                distLeft: parseInt(inputs[6])
            })
        }
        // } else if (entityType === 'BOMB') {
        //     bombs.push({
        //         owner: parseInt(inputs[2]),
        //         source: parseInt(inputs[3]),
        //         target: parseInt(inputs[4]),
        //         distLeft: parseInt(inputs[5])
        //     })
        // }
    }

    throwBomb()

    var sourceFactory;
    while (sourceFactory = getSourceFactory()) {
        var getTargetFactory = generateTargetGetter(sourceFactory);
        var targetFactory;
        while (targetFactory = getTargetFactory()) {
            var cyborgsToSend = getCyborgsNumToSend(sourceFactory, targetFactory);
            if (!cyborgsToSend) {
                continue;
            }

            var route = {
                source: sourceFactory.id,
                target: targetFactory.id,
                cyborgsCount: cyborgsToSend
            };

            turnRoutes.push(route);

            moves.push('MOVE ' + route.source + ' ' + route.target + ' ' + route.cyborgsCount)

            sourceFactory.cyborgsCount -= cyborgsToSend;
        }
    }

    if (moves.length) {
        print(moves.join(';'));
    } else {
        print('WAIT');
    }
}

function getSourceFactory() {
    var fs = Object.values(factories);

    while (myFactoryIndex < fs.length) {
        var f = fs[myFactoryIndex];

        ++myFactoryIndex;

        if (f.owner === 1 && f.cyborgsCount > minCyborgsAtFactory) {
            return f;
        }
    }
    return null;
}

function generateTargetGetter(sourceFactory) {
    var currentDistance = 1;
    var currentFactoryIndex = -1;

    return function () {
        var targetFactory = null;

        // start or continue loop with currentDistance
        for (; currentDistance <= maxDist; currentDistance++) {
            var factoriesAtDistance = sourceFactory.distances[currentDistance];
            if (!factoriesAtDistance) {
                continue;
            }

            // start with 0, continue with next factory
            while (currentFactoryIndex < factoriesAtDistance.length - 1) {
                ++currentFactoryIndex;

                var f = factories[factoriesAtDistance[currentFactoryIndex]];
                if (f.owner === 1 || turnRoutes.find(r => r.targetFactoryId === f.id)) {
                    continue;
                }

                if (f.production > 0) {
                    // neutral or foe but we have enough troops to conqure it - choose it
                    if (f.owner === 0
                        || f.cyborgsCount + f.production < sourceFactory.cyborgsCount + minCyborgsAtFactory) {
                        return f;
                    }

                    // foe factory with many cyborgs
                    targetFactory = f;
                    continue;
                }

                if (!targetFactory) {
                    targetFactory = f;
                }
            }

            currentFactoryIndex = -1;
        };

        return targetFactory;
    }
}

function getCyborgsNumToSend(sourceFactory, targetFactory) {
    var targetFactoryId = targetFactory.id;

    var troopsToTarget = 0;
    var troopsToSource = 0;
    var distToTarget = sourceFactory.distancesF[targetFactoryId];

    for (var i = 0; i !== troops.length; ++i) {
        var t = troops[i];
        
        if (t.target === targetFactoryId && t.distLeft <= distToTarget) {
            troopsToTarget += t.owner === 1 ? -t.cyborgsCount : t.cyborgsCount;
        } else if (t.target === sourceFactory.id && t.owner === -1) {
            troopsToSource += t.cyborgsCount;
        }
    }

    var required = targetFactory.cyborgsCount + troopsToTarget;

    if (targetFactory.owner === -1) {
        required += targetFactory.production * (distToTarget + 1);
    }

    if (required < 0) {
        return 0;
    }

    if (required === 0 && troopsToTarget > 0) {
        return 0;
    }

    var canSend = howManyCanSend(sourceFactory);
    if (sourceFactory.production >= 3) {
        canSend -= troopsToSource;
    }
    
    return canSend > required ? required + 1 : 0;
}

function howManyCanSend(factory) {
    return factory.cyborgsCount - minCyborgsAtFactory;
}

function throwBomb() {
    if (bombsCount === 0){
        return;
    }

    var sourceFactory, targetFactory;
    var fs = Object.values(factories);
    for (var i = 0; i !== fs.length; i++) {
        var f = fs[i];
        if (f.owner === 1) {
            var curProd = (sourceFactory && sourceFactory.production) || 5;
            if (f.production < curProd) {
                sourceFactory = f;
            }
        } else if (f.owner === -1) {
            if (bombTarget) {
                // ToDo: find the nearest base (or not?)
               if (f.production === 3 && (bombTarget.id !== f.id || bombTarget.turnNum - turnNum > 5)) {
                    targetFactory = f;
                } 
            } else {
                var curProdFoe = (targetFactory && targetFactory.prduction) || 1;
                if (f.production > curProdFoe) {
                    targetFactory = f;
                }
            }
        }
    }

    if (sourceFactory && targetFactory) {
        --bombsCount;
        bombTarget = {
            id: targetFactory.id,
            turn: turnNum
        };

        moves.push('BOMB ' + sourceFactory.id + ' ' + targetFactory.id);
        return true;
    }
}