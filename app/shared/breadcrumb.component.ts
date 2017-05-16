/**
 * Copyright 2016-2017 Ping Identity Corporation
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
