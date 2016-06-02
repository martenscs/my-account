/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component } from '@angular/core';
import { Routes } from '@angular/router';

import { ProfileViewComponent, ProfileEditComponent, ChangePasswordComponent } from './index';

@Component({
  selector: 'ubid-profile',
  template: `
      <router-outlet></router-outlet>
    `
})
@Routes([
  {
    path: '/',
    component: ProfileViewComponent
  },
  {
    path: '/edit',
    component: ProfileEditComponent
  },
  {
    path: '/change-password',
    component: ChangePasswordComponent
  }
])
export class ProfileComponent {}