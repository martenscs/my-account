/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Routes } from '@angular/router';

import { IndexComponent } from './index/index';
import { ProfileComponent, ProfileViewComponent, ProfileEditComponent, ChangePasswordComponent } from './profile/index';
import { ConsentComponent, ConsentListComponent, ConsentDetailComponent } from './consent/index';
import { PreferenceComponent, PreferenceViewComponent, CommunicationContentEditComponent,
          TopicEditComponent } from './preference/index';
import { SecondFactorComponent, SecondFactorViewComponent, EmailEditComponent, TelephonyEditComponent,
          TotpEditComponent } from './second-factor/index';
import { ExternalIdentityListComponent } from './external-identity/index';
import { SessionListComponent } from './session/index';
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
    path: 'consent',
    component: ConsentComponent,
    children: [
      { path: '', component: ConsentListComponent },
      { path: ':id', component: ConsentDetailComponent }
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
  {
    path: 'second-factor',
    component: SecondFactorComponent,
    children: [
      { path: '', component: SecondFactorViewComponent },
      { path: 'email', component: EmailEditComponent },
      { path: 'telephony', component: TelephonyEditComponent },
      { path: 'totp', component: TotpEditComponent }
    ]
  },
  { path: 'external-identity', component: ExternalIdentityListComponent },
  { path: 'session', component: SessionListComponent },
  { path: 'error', component: ErrorComponent }
];
