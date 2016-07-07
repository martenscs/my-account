/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { RouterConfig } from '@angular/router';

import { SecondFactorComponent, SecondFactorViewComponent, EmailEditComponent, TelephonyEditComponent,
          TotpEditComponent } from './index';

export const SECOND_FACTOR_ROUTES: RouterConfig = [
  {
    path: 'second-factor',
    component: SecondFactorComponent,
    children: [
      { path: '', component: SecondFactorViewComponent },
      { path: 'email', component: EmailEditComponent },
      { path: 'telephony', component: TelephonyEditComponent },
      { path: 'totp', component: TotpEditComponent }
    ]
  }
];
