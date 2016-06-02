/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'ubid-account-breadcrumb',
  template: `
      <ol class="breadcrumb">
        <li>
          <a [routerLink]="['/']">My Account</a>
        </li>
        <ng-content></ng-content>
      </ol>
    `
})
export class BreadCrumbComponent {}
