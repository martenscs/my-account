/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { provideRouter, RouterConfig } from '@angular/router';

import { PROFILE_ROUTES } from './profile/profile.routes';
import { CONSENT_ROUTES } from './consent/consent.routes';
import { PREFERENCE_ROUTES } from './preference/preference.routes';
import { SECOND_FACTOR_ROUTES } from './second-factor/second-factor.routes';

import { IndexComponent } from './index/index';
import { ExternalIdentityListComponent } from './external-identity/index';
import { SessionListComponent } from './session/index';
import { ErrorComponent } from './error/index';

export const ROUTES: RouterConfig = [
  ...PROFILE_ROUTES,
  ...CONSENT_ROUTES,
  ...PREFERENCE_ROUTES,
  ...SECOND_FACTOR_ROUTES,
  { path: '', component: IndexComponent },
  { path: 'external-identity', component: ExternalIdentityListComponent },
  { path: 'session', component: SessionListComponent },
  { path: 'error', component: ErrorComponent }
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(ROUTES)
];
