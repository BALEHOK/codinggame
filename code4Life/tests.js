var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfig({
  spec_dir: '.',
  spec_files: [
    'test.*.js'
  ]
});

jasmine.execute();