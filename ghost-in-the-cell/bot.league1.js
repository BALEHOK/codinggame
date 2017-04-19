// CONSTS
var maxDist = 20;

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
            // cybNum: null,
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

    myFactoryIndex = 0;
}

function turn() {
    initTurn();

    var entityCount = parseInt(readline()); // the number of entities (e.g. factories and troops)
    for (var i = 0; i < entityCount; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]);
        var entityType = inputs[1];

        if (entityType === 'FACTORY') {
            var f = factories[entityId];
            f.owner = parseInt(inputs[2]);
            f.cybNum = parseInt(inputs[3]);
            f.production = parseInt(inputs[4]);
        } else if (entityType === 'TROOP') {
            troops.push({
                owner: parseInt(inputs[2]),
                source: parseInt(inputs[3]),
                dest: parseInt(inputs[4]),
                sybNum: parseInt(inputs[5]),
                distLeft: parseInt(inputs[6])
            })
        }
    }

    var sourceFactory;
    while (sourceFactory = getSourceFactory()) {
        var targetFactory = getTargetFactory(sourceFactory);
        
        if (targetFactory) {
            turnRoutes.push({
                source: sourceFactory.id,
                target: targetFactory.id,
                cybNum: getCyborgsNumToSend(sourceFactory, targetFactory)
            });
        }
    }

    if (turnRoutes.length) {
        var moves = turnRoutes.map(r => 'MOVE ' + r.source + ' ' + r.target + ' ' + r.cybNum).join(';');
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
        
        if (f.owner === 1 && f.cybNum > 10) {
            return f;
        }
    }
    return null;
}

function getTargetFactory(sourceFactory) {
    var targetFactory = null;

    for (var d = 1; d <= maxDist; d++) {
        var factoriesAtDistance = sourceFactory.distances[d];
        if (!factoriesAtDistance) {
            continue;
        }

        for (var i = 0; i != factoriesAtDistance.length; i++) {
            var f = factories[factoriesAtDistance[0]];
            if (f.owner === 1 || turnRoutes.find(r => r.targetFactoryId === f.id)) {
                continue;
            }

            if (f.production > 0) {
                if (f.owner === 0) {
                    return f;
                }

                if (f.cybNum + f.production < sourceFactory.cybNum) {
                    targetFactory = f;
                    continue;
                }
            }

            if (!targetFactory) {
                targetFactory = f;
            }
        }
    }

    return targetFactory;
}

function getCyborgsNumToSend(sourceFactory, targetFactory) {
    var required = targetFactory.cybNum + targetFactory.production*5;
    var canSend = sourceFactory.cybNum - 10;
    return canSend > required ? required : canSend;
}