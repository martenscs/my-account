/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { bootstrap } from '@angular/platform-browser-dynamic'
import { enableProdMode, provide, PLATFORM_DIRECTIVES } from '@angular/core';
import { ROUTER_PROVIDERS, ROUTER_DIRECTIVES } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_PROVIDERS } from '@angular/http';

import { AppComponent } from './app.component'
import { Configuration } from './app.config'

enableProdMode();

bootstrap(<any> AppComponent, [
    ROUTER_PROVIDERS,
    provide(LocationStrategy, { useClass: HashLocationStrategy }),
    provide(Window, { useValue: window }),
    HTTP_PROVIDERS,
    provide(PLATFORM_DIRECTIVES, { useValue: [ ROUTER_DIRECTIVES ], multi: true }),
    Configuration
  ]);