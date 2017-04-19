// CONSTS
var maxDist = 20;

var factoryCount = parseInt(readline()); // the number of factories
var linkCount = parseInt(readline()); // the number of links between factories
var factories = {};
var myFactories = [];

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
    if (!factory){
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

function turn(){
    var entityCount = parseInt(readline()); // the number of entities (e.g. factories and troops)
    for (var i = 0; i < entityCount; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]);
        var entityType = inputs[1];
        
        if (entityType === 'FACTORY'){
            var f = factories[entityId];
            f.owner = parseInt(inputs[2]);
            f.cybNum = parseInt(inputs[3]);
            f.production = parseInt(inputs[4]);
            // var arg4 = parseInt(inputs[5]);
            // var arg5 = parseInt(inputs[6]);
        }
    }

    var sourceFactory =  getSourceFactory();
    var targetFactoryId = getTargetFactoryId(sourceFactory);

    if (targetFactoryId > -1){
        print('MOVE ' + sourceFactory.id + ' ' + targetFactoryId + ' ' + sourceFactory.cybNum);
    } else {
        print('WAIT');
    }
}

function getSourceFactory() {
    return Object.values(factories).find(f => f.owner === 1 && f.production > 0);
}

function getTargetFactoryId(sourceFactory) {
    var targetFactoryId = -1;
    
    for (var d = 1; d <= maxDist; d++){
        var factoriesAtDistance = sourceFactory.distances[d];
        if (!factoriesAtDistance) {
            continue;
        }
        
        for (var i = 0; i != factoriesAtDistance.length; i++) {
            var f = factories[factoriesAtDistance[0]];
            if (f.owner === 1) {
                continue;
            }
            
            if (f.production > 0){
                if (f.owner === 0) {
                    return f.id;
                }
                
                if (f.cybNum + f.production < sourceFactory.cybNum) {
                    targetFactoryId = f.id;
                    continue;
                }
            }
            
            if (targetFactoryId === -1) {
                targetFactoryId = f.id;
            }
        }
    }
    
    return targetFactoryId;
}