var Jasmine = require('jasmine');
var jasmine = new Jasmine();

const botFile = './bot.wood.1';
console.log('\n*********************************');
console.log('running tests over file', botFile);
console.log('*********************************\n');
global.inTest = true;
global.bot = require(botFile);

jasmine.loadConfig({
  spec_dir: '.',
  spec_files: [
    'test.*.js'
  ]
});

jasmine.execute();
