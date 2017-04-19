function debug(message) {
    printErr(message);
}

let myShips;
let fowShips;
let barrels;

// game loop
while (true) {
    resetStepValues();
    readStepValues();

    step();
}

function resetStepValues() {
    myShips = [];
    fowShips = [];
    barrels = [];
}

function readStepValues() {
    var myShipCount = parseInt(readline()); // the number of remaining ships
    var entityCount = parseInt(readline()); // the number of entities (e.g. ships, mines or cannonballs)
    for (var i = 0; i < entityCount; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]);
        var entityType = inputs[1];
        var x = parseInt(inputs[2]);
        var y = parseInt(inputs[3]);
        var arg1 = parseInt(inputs[4]);
        var arg2 = parseInt(inputs[5]);
        var arg3 = parseInt(inputs[6]);
        var arg4 = parseInt(inputs[7]);

        switch (entityType) {
            case 'SHIP':
                const ship = {
                    id: entityId,
                    x, y,
                    rotation: arg1,
                    speed: arg2, // 0 <= speed <= 2
                    rum: arg3
                };
                if (arg4) { // arg4 === 1 ? my ship : enemy
                    myShips.push(ship);
                } else {
                    fowShips.push(ship);
                }
                break;
            case 'BARREL':
                barrels.push({
                    id: entityId,
                    x, y,
                    rum: arg1
                });
                break;
            default:
                break;
        }
    }
}

function step() {
    const actions = {};
    for (let i = 0; i !== myShips.length; i++) {
        const s = myShips[i];
        let bestScore = 10000000;
        actions[bestScore] = 'WAIT';
        
        for (let j = 0; j !== barrels.length; j++) {
            const b = barrels[j];
            const dx = b.x - s.x;
            const dy = b.y - s.y;

            const dist = Math.sqrt(dx*dx + dy*dy);
            actions[dist] = `MOVE ${b.x} ${b.y}`;
            if (dist < bestScore) {
                bestScore = dist;
            }
        }

        print(actions[bestScore]);
    }
}