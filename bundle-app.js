var SystemBuilder = require('systemjs-builder');
var builder = new SystemBuilder();

builder.loadConfig('./system.config.js')
    .then(function() {
      return builder.bundle(
          'app - dist/vendor/lib-bundle.js',
          'dist/app/app-bundle.js',
          { minify: true, sourceMaps: true, lowResSourceMaps: true });
    })
    .then(function() {
      console.log('Application bundle built successfully');
    });
