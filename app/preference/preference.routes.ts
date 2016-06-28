/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { RouterConfig } from '@angular/router';

import { PreferenceComponent, PreferenceViewComponent, CommunicationContentEditComponent,
          TopicEditComponent } from './index';

export const PREFERENCE_ROUTES: RouterConfig = [
  {
    path: 'preference',
    component: PreferenceComponent,
    children: [
      { path: '', component: PreferenceViewComponent },
      { path: 'communication-content', component: CommunicationContentEditComponent },
      { path: 'topic', component: TopicEditComponent }
    ]
  }
];
