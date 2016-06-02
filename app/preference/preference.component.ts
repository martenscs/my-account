/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component } from '@angular/core';
import { Routes } from '@angular/router';

import { PreferenceViewComponent, CommunicationContentEditComponent, TopicEditComponent } from './index';

@Component({
  selector: 'ubid-preference',
  template: `
      <router-outlet></router-outlet>
    `
})
@Routes([
  {
    path: '/',
    component: PreferenceViewComponent
  },
  {
    path: '/communication-content',
    component: CommunicationContentEditComponent
  },
  {
    path: '/topic',
    component: TopicEditComponent
  }
])
export class PreferenceComponent {}