/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { RouterConfig } from '@angular/router';

import { ProfileComponent, ProfileViewComponent, ProfileEditComponent, ChangePasswordComponent } from './index';

export const PROFILE_ROUTES: RouterConfig = [
  {
    path: 'profile',
    component: ProfileComponent,
    children: [
      { path: '', component: ProfileViewComponent },
      { path: 'edit', component: ProfileEditComponent },
      { path: 'change-password', component: ChangePasswordComponent }
    ]
  }
];
