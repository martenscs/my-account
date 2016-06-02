(function() {

  var map = {
    'app': 'dist/app',
    'rxjs': 'node_modules/rxjs',
    '@angular': 'node_modules/@angular'
  };

  var packages = {
    'app': { main: 'main',  defaultExtension: 'js' },
    'rxjs': { main: 'Rx', defaultExtension: 'js' }
  };

  [
    '@angular/core',
    '@angular/compiler',
    '@angular/common',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/http',
    '@angular/router'
  ].forEach(function(name) {
    packages[name] = { main: 'index', defaultExtension: 'js' };
  });

  System.config({
    map: map,
    packages: packages
  });

})();