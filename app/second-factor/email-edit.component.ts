/**
 * Copyright 2016-2017 Ping Identity Corporation
 * All Rights Reserved.
 */

import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ScimService, Profile } from '../shared/index'
import { template } from './email-edit.html';

@Component({
  selector: 'ubid-email-edit',
  template: template
})
export class EmailEditComponent implements OnInit {

  private _emailAddress: string;

  code: string;
  showCode: boolean;

  constructor(private router: Router, private scimService: ScimService) { }

  get emailAddress() {
    return this._emailAddress;
  }

  @Input()
  set emailAddress(value: string) {
    this._emailAddress = value ? value.trim() : value;

    // make them re-validate the address
    this.showCode = false;
    this.code = undefined;
  }

  ngOnInit() {
    // initialize the email address
    this.scimService.validatedEmailAddress$
        .subscribe(
            (data: any) => {
              if (data.attributeValue) {
                // we have a validated email address - use it
                this.emailAddress = data.attributeValue;
              }
              else {
                // we don't have a validated email address - use the one from the profile, if any
                this.scimService.profile$
                    .subscribe(
                        (profile: Profile) => this.emailAddress = profile.email,
                        () => {}
                    ).unsubscribe();
              }
            },
            () => {}
        ).unsubscribe();
  }

  verifyEmailAddress() {
    this.scimService.validateEmailAddress(this.emailAddress)
        .subscribe(
            (data: any) => this.showCode = data.codeSent,
            () => {}
        );
  }

  verifyCode() {
    // on success, go back to second factor (error handled by service)
    this.scimService.validateEmailCode(this.code)
        .subscribe(
            (data: any) => {
              if (data.validated) {
                this.router.navigate(['/second-factor']);
              }
            },
            () => {
              // clear the code field on error
              this.code = '';
            }
        );
  }

  cancel() {
    // refresh the validated email address info in case a partial verification was done
    this.scimService.fetchValidatedEmailAddress();
  }
}