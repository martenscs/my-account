var SystemBuilder = require('systemjs-builder');
var builder = new SystemBuilder();

builder.loadConfig('./system.config.js')
    .then(function() {
      return builder.bundle(
          'app - [dist/app/**/*]', // build app and remove the app code - this leaves only external dependencies
          'dist/vendor/lib-bundle.js',
          { minify: true, sourceMaps: false });
    })
    .then(function() {
      console.log('Library bundle built successfully');
    });
