var Jasmine = require('jasmine');
var jasmine = new Jasmine();
console.log('huy')
jasmine.loadConfig({
  spec_dir: '.',
  spec_files: [
    'test.*.js'
  ]
});

jasmine.execute();