/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component } from '@angular/core';
import { Routes } from '@angular/router';

import { ConsentListComponent, ConsentDetailComponent } from './index';

@Component({
  selector: 'ubid-consent',
  template: `
      <router-outlet></router-outlet>
    `
})
@Routes([
  {
    path: '/',
    component: ConsentListComponent
  },
  {
    path: '/detail/:id',
    component: ConsentDetailComponent
  }
])
export class ConsentComponent {}