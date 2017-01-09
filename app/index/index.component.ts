/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Configuration, ScimService, Profile } from '../shared/index';
import { template } from './index.html';

@Component({
  selector: 'ubid-account-index',
  template: template
})
export class IndexComponent implements OnInit, OnDestroy  {

  // TODO: subscription and profile variables may be unnecessary if angular supports assigning expression
  // results to template local variables:
  //    https://github.com/angular/angular/issues/2451
  private subscription: Subscription;

  profile: Profile;
  isBrokerIdp = false;

  constructor(private configuration: Configuration, private scimService: ScimService) {}

  ngOnInit() {
    this.isBrokerIdp = this.configuration.isBrokerIdp;

    this.subscription = this.scimService.profile$
        .subscribe((profile: Profile) => this.profile = profile);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
