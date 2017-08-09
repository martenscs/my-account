/**
 * Copyright 2016-2017 Ping Identity Corporation
 * All Rights Reserved.
 */

import { Routes } from '@angular/router';

import { IndexComponent } from './index/index';
import { ProfileComponent, ProfileViewComponent, ProfileEditComponent, ChangePasswordComponent } from './profile/index';
import { PreferenceComponent, PreferenceViewComponent, CommunicationContentEditComponent,
          TopicEditComponent } from './preference/index';
import { ErrorComponent } from './error/index';

export const ROUTES: Routes = [
  { path: '', component: IndexComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    children: [
      { path: '', component: ProfileViewComponent },
      { path: 'edit', component: ProfileEditComponent },
      { path: 'change-password', component: ChangePasswordComponent }
    ]
  },
  {
    path: 'preference',
    component: PreferenceComponent,
    children: [
      { path: '', component: PreferenceViewComponent },
      { path: 'communication-content', component: CommunicationContentEditComponent },
      { path: 'topic', component: TopicEditComponent }
    ]
  },
  { path: 'error', component: ErrorComponent }
];
