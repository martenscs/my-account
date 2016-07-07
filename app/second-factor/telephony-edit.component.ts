/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { BreadCrumbComponent, ScimService, Profile, VALIDATE_PHONE_NUMBER } from '../shared/index'
import { template } from './telephony-edit.html';

@Component({
  selector: 'ubid-telephony-edit',
  template: template,
  directives: [ BreadCrumbComponent ]
})
export class TelephonyEditComponent implements OnInit {

  private _phoneNumber: string;
  private _messagingProvider = VALIDATE_PHONE_NUMBER.MESSAGING_PROVIDERS.SMS;

  code: string;
  showCode: boolean;

  validatePhoneNumberConfig = VALIDATE_PHONE_NUMBER;

  constructor(private router: Router, private scimService: ScimService) { }

  get phoneNumber() {
    return this._phoneNumber;
  }

  @Input()
  set phoneNumber(value: string) {
    this._phoneNumber = value;

    // make them re-validate the address
    this.resetCode();
  }

  get messagingProvider() {
    return this._messagingProvider;
  }

  @Input()
  set messagingProvider(value: string) {
    this._messagingProvider = value;

    // make them re-validate the address
    this.resetCode();
  }

  ngOnInit() {
    // initialize the phone number
    this.scimService.validatedPhoneNumber$
        .subscribe(
            (data: any) => {
              if (data.attributeValue) {
                // we have a validated phone number - use it
                this._phoneNumber = data.attributeValue;
              }
              else {
                // we don't have a validated phone number - use the one from the profile, if any
                this.scimService.profile$
                    .subscribe(
                        (profile: Profile) => this._phoneNumber = profile.phone,
                        () => {}
                    ).unsubscribe();
              }
            },
            () => {}
        ).unsubscribe();
  }

  verifyPhoneNumber() {
    this.scimService.validateTelephony(this.phoneNumber, this.messagingProvider)
        .subscribe(
            (data: any) => this.showCode = data.codeSent,
            () => {}
        );
  }

  verifyCode() {
    // on success, go back to second factor (error handled by service)
    this.scimService.validateTelephonyCode(this.code)
        .subscribe(
            (data: any) => {
              if (data.validated) {
                this.router.navigate(['/second-factor']);
              }
            },
            () => {}
        );
  }

  private resetCode() {
    this.showCode = false;
    this.code = undefined;
  }
}