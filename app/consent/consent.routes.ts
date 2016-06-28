/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { RouterConfig } from '@angular/router';

import { ConsentComponent, ConsentListComponent, ConsentDetailComponent } from './index';

export const CONSENT_ROUTES: RouterConfig = [
  {
    path: 'consent',
    component: ConsentComponent,
    children: [
      { path: '', component: ConsentListComponent },
      { path: ':id', component: ConsentDetailComponent }
    ]
  }
];
