// printErr('Debug messages...');

// CONSTS
var maxDist = 20;

var minCyborgsAtFactory = 0;

var factoryCount = parseInt(readline()); // the number of factories
var linkCount = parseInt(readline()); // the number of links between factories

var turnNum = 0;

var factories = {};
var myFactories = [];

var troops = [];

for (var i = 0; i < linkCount; i++) {
    var inputs = readline().split(' ');
    var factory1Id = parseInt(inputs[0]);
    var factory2Id = parseInt(inputs[1]);
    var distance = parseInt(inputs[2]);

    addDistance(factory1Id, factory2Id, distance);
    addDistance(factory2Id, factory1Id, distance);
}

function addDistance(factory1Id, factory2Id, distance) {
    var f = getOrInitFactory(factory1Id);
    (f.distances[distance] || (f.distances[distance] = [])).push(factory2Id);
}

function getOrInitFactory(factoryId) {
    var factory = factories[factoryId];
    if (!factory) {
        factory = {
            id: factoryId,
            distances: [],
            // owner: null,
            // cyborgsCount: null,
            // production: null,
        };
        factories[factoryId] = factory;
    }
    return factory;
}

// game loop
while (true) {
    turn()
}

var turnRoutes,
    myFactoryIndex;
function initTurn() {
    ++turnNum;
    troops = [];
    turnRoutes = [];
    myFactories = [];

    myFactoryIndex = 0;
}

function turn() {
    initTurn();

    if (turnNum > 30) {
        minCyborgsAtFactory = 5;
    }

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
    }

    var sourceFactory;
    printErr('turn num ' + turnNum);
    while (sourceFactory = getSourceFactory()) {
        printErr('sourceFactory ' + sourceFactory.id);

        var getTargetFactory = generateTargetGetter(sourceFactory);
        var targetFactory;
        while (targetFactory = getTargetFactory()) {
            var cyborgsToSend = getCyborgsNumToSend(sourceFactory, targetFactory);
            if (!cyborgsToSend) {
                continue;
            }

            turnRoutes.push({
                source: sourceFactory.id,
                target: targetFactory.id,
                cyborgsCount: cyborgsToSend
            });

            sourceFactory.cyborgsCount -= cyborgsToSend;
        }
    }

    if (turnRoutes.length) {
        var moves = turnRoutes.map(r => 'MOVE ' + r.source + ' ' + r.target + ' ' + r.cyborgsCount).join(';');
        print(moves);
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
    for (var i = 0; i !== troops.length; ++i) {
        var t = troops[i];
        if (t.target === targetFactoryId) {
            troopsToTarget += t.owner === 1 ? -t.cyborgsCount : t.cyborgsCount;
        } else if (t.target === sourceFactory.id) {
            troopsToSource += t.cyborgsCount;
        }
    }

    var required = targetFactory.cyborgsCount + troopsToTarget;

    if (targetFactory.owner === -1) {
        var dist = sourceFactory.distances.findIndex(d => d && d.includes(targetFactoryId));
        required += targetFactory.production * (dist + 2);
    }

    if (required < 0) {
        return 0;
    }

    if (required === 0 && troopsToTarget > 0) {
        return 0;
    }

    var canSend = howManyCanSend(sourceFactory) - troopsToSource;
    return canSend > required ? required + 1 : 0;
}

function howManyCanSend(factory) {
    return factory.cyborgsCount - minCyborgsAtFactory;
}