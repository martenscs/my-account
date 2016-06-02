/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { BreadCrumbComponent, ScimService, Profile, AddressPipe } from '../shared/index';
import { template } from './profile-view.html';

@Component({
  selector: 'ubid-account-profile-view',
  template: template,
  directives: [ BreadCrumbComponent ],
  pipes: [ AddressPipe ]
})
export class ProfileViewComponent implements OnInit, OnDestroy  {

  // TODO: subscription and profile variables may be unnecessary if angular supports assigning expression
  // results to template local variables:
  //    https://github.com/angular/angular/issues/2451
  private subscription: Subscription;

  profile: Profile;

  constructor(private scimService: ScimService) {}

  ngOnInit() {
    this.subscription = this.scimService.profile$
        .subscribe((profile: Profile) => this.profile = profile);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
