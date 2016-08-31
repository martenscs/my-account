/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { ScimService, VALIDATE_PHONE_NUMBER } from '../shared/index'
import { template } from './second-factor-view.html';


enum AuthenticationMethod { Email, Phone, TOTP }


@Component({
  selector: 'ubid-account-second-factor-view',
  template: template
})
export class SecondFactorViewComponent implements OnInit, OnDestroy  {

  private profileSubscription: Subscription;
  private validatedEmailAddressSubscription: Subscription;
  private validatedPhoneNumberSubscription: Subscription;
  private totpSharedSecretSubscription: Subscription;
  private authenticationMethodToRemove: AuthenticationMethod;

  profile: any;
  validatedEmailAddress: any;
  validatedPhoneNumber: any;
  totpSharedSecret: any;

  validatePhoneNumberConfig = VALIDATE_PHONE_NUMBER;

  showConfirmDisable = false;

  confirmRemovePrompt = '';
  showConfirmRemove = false;

  constructor(private router: Router, private scimService: ScimService) {}

  ngOnInit() {
    this.profileSubscription = this.scimService.profile$
        .subscribe((data: any) => this.profile = data);
    this.validatedEmailAddressSubscription = this.scimService.validatedEmailAddress$
        .subscribe((data: any) => this.validatedEmailAddress = data);
    this.validatedPhoneNumberSubscription = this.scimService.validatedPhoneNumber$
        .subscribe((data: any) => this.validatedPhoneNumber = data);
    this.totpSharedSecretSubscription = this.scimService.totpSharedSecret$
        .subscribe((data: any) => this.totpSharedSecret = data);
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.validatedEmailAddressSubscription) {
      this.validatedEmailAddressSubscription.unsubscribe();
    }
    if (this.validatedPhoneNumberSubscription) {
      this.validatedPhoneNumberSubscription.unsubscribe();
    }
    if (this.totpSharedSecretSubscription) {
      this.totpSharedSecretSubscription.unsubscribe();
    }
  }

  toggleEnable(enable: boolean) {
    if (enable) {
      this.scimService.toggleSecondFactorEnable(true);
    }
    else {
      this.showConfirmDisable = true;
    }
  }

  disableConfirmClosed(confirm: boolean) {
    if (confirm) {
      this.scimService.toggleSecondFactorEnable(false);
    }
    this.showConfirmDisable = false;
  }

  get secondFactorEnabled(): boolean {
    return this.profile && this.profile.record && this.profile.record.secondFactorEnabled;
  }

  get verificationMethodConfigured(): boolean {
    return this.emailConfigured || this.telephonyConfigured || this.totpConfigured;
  }

  get emailConfigured(): boolean {
    return this.validatedEmailAddress && this.validatedEmailAddress.attributeValue &&
        this.validatedEmailAddress.validated;
  }

  get telephonyConfigured(): boolean {
    return this.validatedPhoneNumber && this.validatedPhoneNumber.attributeValue && this.validatedPhoneNumber.validated;
  }

  get totpConfigured(): boolean {
    return this.totpSharedSecret && this.totpSharedSecret.registered;
  }

  removeEmail(confirm: boolean) {
    if (confirm === undefined) {
      this.showConfirmRemoveModal(AuthenticationMethod.Email);
    }
    else if (confirm) {
      this.scimService.removeValidatedEmailAddress(! this.telephonyConfigured && ! this.totpConfigured);
    }
  }

  removeTelephony(confirm: boolean) {
    if (confirm === undefined) {
      this.showConfirmRemoveModal(AuthenticationMethod.Phone);
    }
    else if (confirm) {
      this.scimService.removeValidatedPhoneNumber(! this.emailConfigured && ! this.totpConfigured);
    }
  }

  removeTotp(confirm: boolean) {
    if (confirm === undefined) {
      this.showConfirmRemoveModal(AuthenticationMethod.TOTP);
    }
    else if (confirm) {
      this.scimService.removeTotpSharedSecret(! this.emailConfigured && ! this.telephonyConfigured);
    }
  }

  configureTotp() {
    // only allow TOTP configuration if it isn't already configured
    if (! this.totpConfigured) {
      this.router.navigate(['/second-factor/totp']);
    }
  }

  showConfirmRemoveModal(method: AuthenticationMethod) {
    var prompt = 'If you continue, you will no longer be able to use this authentication method for second factor.';
    if (this.secondFactorEnabled &&
        [this.emailConfigured, this.telephonyConfigured, this.totpConfigured].filter((v: boolean) => v).length === 1) {
      prompt = 'You are removing your only authentication method. If you continue, second factor will be disabled.';
    }
    this.authenticationMethodToRemove = method;
    this.confirmRemovePrompt = prompt;
    this.showConfirmRemove = true;
  }

  removeAuthenticationMethodClosed(confirm: boolean) {
    if (this.authenticationMethodToRemove == AuthenticationMethod.Email) {
      this.removeEmail(confirm);
    }
    else if (this.authenticationMethodToRemove == AuthenticationMethod.Phone) {
      this.removeTelephony(confirm);
    }
    else if (this.authenticationMethodToRemove == AuthenticationMethod.TOTP) {
      this.removeTotp(confirm);
    }
    this.showConfirmRemove = false;
  }
}
