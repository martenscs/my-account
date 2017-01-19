/**
 * Copyright 2016-2017 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ScimService } from '../shared/index'
import { template } from './totp-edit.html';

@Component({
  selector: 'ubid-totp-edit',
  template: template
})
export class TotpEditComponent implements OnInit {
  totp: string;
  uri: string;
  secret: string;
  showSecret = false;
  
  constructor(private router: Router, private scimService: ScimService) { }

  ngOnInit() {
    this.totp = undefined;

    this.createTotpSharedSecret();
  }

  createTotpSharedSecret() {
    var subscription: any;

    subscription = this.scimService.createTotpSharedSecret()
        .subscribe(
            (data: any) => {
              this.uri = data.otpAuthUri;
              this.secret = data.sharedSecret;

              subscription.unsubscribe();
            },
            () => {}
        );
  }

  validateTotp() {
    this.scimService.validateTotp(this.totp)
        .subscribe(
            (data: any) => {
              if (data.registered) {
                this.router.navigate(['/second-factor']);
              }
            },
            () => {
              // clear the totp field on error
              this.totp = '';
            }
        );
  }
}
