/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/empty';

import { AlertService, HttpWrapper, LoadingService, Utility, Profile, VALIDATE_EMAIL_ADDRESS,
    VALIDATE_PHONE_NUMBER, URN_PREFIX } from '../index';


const STORAGE_KEY: any = {
  FLOW_STATE: 'my_account_flow_state',
  ACCESS_TOKEN: 'my_account_access_token',
  STATE: 'my_account_state'
};


@Injectable()
export class ScimService {

  private window: Window;

  public initialized: boolean = false;

  public error: any;
  
  public isIdpCallback: boolean = false;

  private profile: BehaviorSubject<Profile> = new BehaviorSubject(undefined);
  private _profile$: Observable<Profile> = this.profile.asObservable();

  private passwordQualityRequirements: BehaviorSubject<any> = new BehaviorSubject(undefined);
  private _passwordQualityRequirements$: Observable<any> = this.passwordQualityRequirements.asObservable();

  private sessions: BehaviorSubject<any[]> = new BehaviorSubject(undefined);
  private _sessions$: Observable<any> = this.sessions.asObservable();

  private consents: BehaviorSubject<any[]> = new BehaviorSubject(undefined);
  private _consents$: Observable<any> = this.consents.asObservable();

  private externalIdentities: BehaviorSubject<any[]> = new BehaviorSubject(undefined);
  private _externalIdentities$: Observable<any> = this.externalIdentities.asObservable();

  private validatedEmailAddress: BehaviorSubject<any> = new BehaviorSubject(undefined);
  private _validatedEmailAddress$: Observable<any> = this.validatedEmailAddress.asObservable();

  private validatedPhoneNumber: BehaviorSubject<any> = new BehaviorSubject(undefined);
  private _validatedPhoneNumber$: Observable<any> = this.validatedPhoneNumber.asObservable();

  private totpSharedSecret: BehaviorSubject<any> = new BehaviorSubject(undefined);
  private _totpSharedSecret$: Observable<any> = this.totpSharedSecret.asObservable();

  private criticalError: BehaviorSubject<any> = new BehaviorSubject(undefined);
  private _criticalError$: Observable<any> = this.criticalError.asObservable();

  private handleError = (err: Response) => {
    var error: any = this.formatError(err);
    // is it a critical error?
    if (error.details === '401' || error.details === 'ProgressEvent') {
      this.error = error;
      this.criticalError.next(this.error);
    }
    else {
      // not critical, just alert it
      this.alertService.add(error.message);
    }
  };

  constructor(@Inject(Window) window: Window,
              private alertService: AlertService,
              private httpWrapper: HttpWrapper,
              private loadingService: LoadingService) {

    this.window = window;

    this.init();
  }
  
  init() {
    // process the initial search params when the app/service loads
    var params: Object = HttpWrapper.parseParams(this.window.location.search);
    if (params['csearch']) {
      // this is an IDP callback
      // restore the access token
      var token: string = this.window.sessionStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
      if (token) {
        this.httpWrapper.bearerToken = token;
        this.window.sessionStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
      }
      // finish the callback operation
      this.isIdpCallback = true;
      this.idpCallback(params['csearch']);
    }
    else if (params['chash']) {
      // this is an OAuth callback
      params = HttpWrapper.parseParams(HttpWrapper.decodeCallbackArg(params['chash']));
      if (params['access_token']) {
        // validate state
        if (params['state'] !== this.window.sessionStorage.getItem(STORAGE_KEY.STATE)) {
          this.error = this.formatError('The given state value (' + params['state'] + ') does not match what was ' +
              'sent with the request (' + this.window.sessionStorage.getItem(STORAGE_KEY.STATE) + ')');
        }
        else {
          this.httpWrapper.bearerToken = params['access_token'];
        }
      }
      else if (params['error']) {
        this.error = this.formatError(params['error_description'] || params['error'],
            params['error_description'] ? params['error'] : undefined);
        this.error.message = this.error.message.replace(/\+/g, ' ');
      }
      else {
        this.error = this.formatError('Unexpected OAuth callback parameters');
      }
    }
    else {
      // redirect for access token
      var state = Utility.getRandomInt(0, 999999);
      this.window.sessionStorage.setItem(STORAGE_KEY.STATE, state.toString());
      var uri = this.httpWrapper.getAuthorizeUrl(state);
      this.window.location.assign(uri);
      return;
    }
    this.initialized = true;
  }

  get profile$(): Observable<Profile> {
    // lazy-load the profile
    if (! this.profile.getValue()) {
      this.fetchProfile();
      // also, pre-fetch the password quality requirements so we have them up front if they change password
      this.fetchPasswordQualityRequirements();
    }
    return this._profile$;
  }

  get passwordQualityRequirements$(): Observable<any> {
    // lazy-load the requirements
    if (! this.passwordQualityRequirements.getValue()) {
      this.fetchPasswordQualityRequirements();
    }
    return this._passwordQualityRequirements$;
  }

  get sessions$(): Observable<any[]> {
    // lazy-load the sessions (and force refresh every subscription)
    this.fetchSessions();
    return this._sessions$;
  }

  get consents$(): Observable<any[]> {
    // lazy-load the consents
    if (! this.consents.getValue()) {
      this.fetchConsents();
    }
    return this._consents$;
  }

  get externalIdentities$(): Observable<any[]> {
    // lazy-load the external identities
    if (! this.externalIdentities.getValue()) {
      this.fetchExternalIdentities();
    }
    return this._externalIdentities$;
  }

  get validatedEmailAddress$(): Observable<any[]> {
    // lazy-load the validated email addresses
    if (! this.validatedEmailAddress.getValue()) {
      this.fetchValidatedEmailAddress();
    }
    return this._validatedEmailAddress$;
  }

  get validatedPhoneNumber$(): Observable<any[]> {
    // lazy-load the validated phone number
    if (! this.validatedPhoneNumber.getValue()) {
      this.fetchValidatedPhoneNumber();
    }
    return this._validatedPhoneNumber$;
  }

  get totpSharedSecret$(): Observable<any[]> {
    // lazy-load the TOTP secret information
    if (! this.totpSharedSecret.getValue()) {
      this.fetchTotpSharedSecret();
    }
    return this._totpSharedSecret$;
  }

  get criticalError$(): Observable<any> {
    return this._criticalError$;
  }

  fetchProfile(): Observable<Profile> {
    var o = this.httpWrapper.get(this.getUrl('Me'));
    o.subscribe((data: any) => this.profile.next(new Profile(data)),
        this.handleError);
    return o;
  }

  fetchPasswordQualityRequirements(): Observable<any> {
    var o = this.httpWrapper.get(this.getUrl('Me/passwordQualityRequirements'));
    o.subscribe((data: any) => this.passwordQualityRequirements.next(data),
        this.handleError);
    return o;
  }

  fetchSessions(): Observable<any[]> {
    var o = this.httpWrapper.get(this.getUrl('Me/sessions'));
    o.subscribe((data: any) => {
          if (data.Resources) {
            data.Resources.forEach((session: any) => {
              session.platform = platform.parse(session.userAgentString);
            });
          }
          this.sessions.next(data.Resources);
        },
        this.handleError
    );
    return o;
  }

  fetchConsents(): Observable<any[]> {
    var o = this.httpWrapper.get(this.getUrl('Me/consents'));
    o.subscribe(
        (data: any) => {
          if (data.Resources) {
            data.Resources.forEach(this.processRecord);
          }
          this.consents.next(data.Resources);
        },
        this.handleError
    );
    return o;
  }

  fetchExternalIdentities(): Observable<any[]> {
    var o = this.httpWrapper.get(this.getUrl('Me/externalIdentities'));
    o.subscribe(
        (data: any) => this.externalIdentities.next(data.Resources),
        this.handleError
    );
    return o;
  }

  fetchValidatedEmailAddress(): Observable<any> {
    var attributePath = 'secondFactorEmail';
    var o = this.httpWrapper.get(this.getUrl('Me/validatedEmailAddresses' +
        '?filter=attributePath eq "' + attributePath + '"'));
    o.subscribe(
        (data: any) => {
          if (! data.totalResults) {
            this.alertService.add('validatedEmailAddresses returned no results for attributePath "' + attributePath +
                '". Verify the Email Validator SCIM Sub Resource Type Handler is configured properly for this sample.');
            data = undefined;
          }
          else {
            data = this.processRecord(data.Resources[0]);
          }
          return this.validatedEmailAddress.next(data);
        },
        this.handleError
    );
    return o;
  }

  fetchValidatedPhoneNumber(): Observable<any> {
    var attributePath = 'secondFactorPhoneNumber';
    var o = this.httpWrapper.get(this.getUrl('Me/validatedPhoneNumbers' +
        '?filter=attributePath eq "' + attributePath + '"'));
    o.subscribe(
        (data: any) => {
          if (! data.totalResults) {
            this.alertService.add('validatedPhoneNumbers returned no results for attributePath "' + attributePath +
                '". Verify the Telephony Validator SCIM Sub Resource Type Handler is configured properly for this ' +
                'sample.');
            data = undefined;
          }
          else {
            data = this.processRecord(data.Resources[0]);
          }
          return this.validatedPhoneNumber.next(data);
        },
        this.handleError
    );
    return o;
  }

  fetchTotpSharedSecret(): Observable<any> {
    var o = this.httpWrapper.get(this.getUrl('Me/totpSharedSecret'));
    o.subscribe(
        (data: any) => this.totpSharedSecret.next(this.processRecord(data)),
        this.handleError
    );
    return o;
  }

  updateProfile(profile: Profile,
                updateCommunicationContentOptions = false,
                updateTopicPreferences = false): Observable<any> {
    // ensure the full name attribute is populated from the other name attributes
    Profile.updateFullName(profile);
    // update the profile
    var o = this.httpWrapper.put(Profile.getLocation(profile), JSON.stringify(Profile.toScim(profile,
        updateCommunicationContentOptions, updateTopicPreferences)));
    o.subscribe((data: any) => this.profile.next(new Profile(data)),
        this.handleError);
    return o;
  }

  changePassword(newPassword: string, currentPassword?: string): Observable<any> {
    var data: any = {
      schemas: [ URN_PREFIX + 'scim:api:messages:2.0:PasswordUpdateRequest' ],
      newPassword: newPassword,
      currentPassword: currentPassword
    };
    var o = this.httpWrapper.put(this.getUrl('Me/password'), JSON.stringify(data));
    o.subscribe(() => {},
        (err: any) => {
          var error: any;
          // provide a friendly error message if the error is due to incorrect current password provided
          if (currentPassword && err.status === 401) {
            error = HttpWrapper.parseResponse(err);
            if (error && error.detail && error.detail.indexOf('invalid credentials') !== -1) {
              err = 'The current password is incorrect.';
            }
          }
          return this.handleError(err);
        });
    return o;
  }

  idpCallback(cbArg: any): Observable<any> {
    var cbParams: any, flowState: any, data: any;

    // decode and parse the parameters from the callback arg
    cbParams = HttpWrapper.parseParams(HttpWrapper.decodeCallbackArg(cbArg));

    // retrieve the flow state
    flowState = JSON.parse(this.window.sessionStorage.getItem(STORAGE_KEY.FLOW_STATE));
    this.window.sessionStorage.removeItem(STORAGE_KEY.FLOW_STATE);

    // build the data to put
    data = {
      callbackParameters: cbParams,
      flowState: flowState.flowState
    };

    var o = this.httpWrapper.put(this.getLocation(flowState), JSON.stringify(data));
    o.subscribe(
        (data: any) => {
          var identities: any[] = this.externalIdentities.getValue();
          var identity: any = identities.find((ei: any) => ei.id === data.id);
          identity.providerUserId = data.providerUserId;
          this.externalIdentities.next(identities);
        },
        this.handleError
    );
    return o;
  }

  linkExternalIdentity(externalIdentity: any) : Observable<any> {
    var data: any = {
      callbackUrl: this.httpWrapper.getUrl('callback.html'),
      provider: {
        name: externalIdentity.provider.name
      },
      schemas: externalIdentity.schemas
    };

    var o = this.httpWrapper.post(this.getUrl('Me/externalIdentities'), JSON.stringify(data));
    o.subscribe(
          (data: any) => {
            // store the flow state and access token for when we return
            this.window.sessionStorage.setItem(STORAGE_KEY.FLOW_STATE, JSON.stringify(data));
            this.window.sessionStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, this.httpWrapper.bearerToken);

            // start the busy indicator
            this.loadingService.start('redirect');
            
            // redirect to the provider redirect url
            this.window.location.assign(data.providerRedirectUrl);
          },
          this.handleError
        );
    return o;
  }

  removeExternalIdentity(externalIdentity: any): Observable<any> {
    var o = this.httpWrapper.delete(this.getLocation(externalIdentity));
    o.subscribe(
        () => {
          var identities: any[] = this.externalIdentities.getValue();
          var identity: any = identities.find((ei: any) => ei.id === externalIdentity.id);
          identity.providerUserId = null;
          this.externalIdentities.next(identities);
        },
        this.handleError
    );
    return o;
  }

  removeSession(session: any): Observable<any> {
    return this.removeSubjectEntry(this.sessions, session);
  }

  removeConsent(consent: any): Observable<any> {
    return this.removeSubjectEntry(this.consents, consent);
  }

  toggleSecondFactorEnable(enable: boolean): Observable<any> {
    var profile = Utility.clone(this.profile.getValue());
    profile.record.secondFactorEnabled = enable;

    return this.updateProfile(profile);
  }

  validateEmailAddress(emailAddress: string): Observable<any> {
    var validatedEmailAddress: any, body:any, o: Observable<any>;

    validatedEmailAddress = this.validatedEmailAddress.getValue();
    if (! validatedEmailAddress || ! validatedEmailAddress.attributePath) {
      this.alertService.add('validatedEmailAddresses or attributePath not found. Verify the Email Validator SCIM Sub ' +
          'Resource Type Handler is configured properly for this sample.');
      return Observable.empty();
    }

    body = {
      attributePath: validatedEmailAddress.attributePath,
      attributeValue: emailAddress,
      messageSubject: VALIDATE_EMAIL_ADDRESS.SUBJECT,
      messageText: VALIDATE_EMAIL_ADDRESS.TEXT,
      schemas: validatedEmailAddress.schemas
    };

    o = this.httpWrapper.post(this.getUrl('Me/validatedEmailAddresses'), JSON.stringify(body));
    o.subscribe(
        (data: any) => this.validatedEmailAddress.next(this.processRecord(data)),
        this.handleError
    );
    return o;
  }

  validateEmailCode(code: string): Observable<any> {
    var validatedEmailAddress: any, o: Observable<any>;

    validatedEmailAddress = this.validatedEmailAddress.getValue();
    if (! validatedEmailAddress || ! validatedEmailAddress.attributePath) {
      this.alertService.add('validatedEmailAddresses or attributePath not found. Verify the Email Validator SCIM Sub ' +
          'Resource Type Handler is configured properly for this sample.');
      return Observable.empty();
    }

    validatedEmailAddress = Utility.clone(validatedEmailAddress);
    validatedEmailAddress.verifyCode = code;

    o = this.httpWrapper.put(this.getLocation(validatedEmailAddress), JSON.stringify(validatedEmailAddress));
    o.subscribe(
        (data: any) => {
          // store the validated address information
          this.validatedEmailAddress.next(this.processRecord(data));

          // refresh our profile attributes to pickup the address in case it was updated
          this.fetchProfile();
        },
        this.handleError
    );

    return o;
  }

  removeValidatedEmailAddress(disableSecondFactor: boolean): Observable<any> {
    var profile: Profile, o: Observable<any>;

    // clear the second factor email attribute
    profile = Utility.clone(this.profile.getValue());
    profile.record.secondFactorEmail = null;
    o = this.updateProfile(profile);

    // disable second factor if necessary
    if (disableSecondFactor) {
      o = o.flatMap(() => this.toggleSecondFactorEnable(! disableSecondFactor)).share();  
    }

    // update the validated email record
    o.subscribe(
        () => this.fetchValidatedEmailAddress(),
        () => {}
    );

    return o;
  }

  validateTelephony(phoneNumber: string, messagingProvider: string): Observable<any> {
    var validatedPhoneNumber: any, body:any, o: Observable<any>;

    validatedPhoneNumber = this.validatedPhoneNumber.getValue();
    if (! validatedPhoneNumber || ! validatedPhoneNumber.attributePath) {
      this.alertService.add('validatedPhoneNumber or attributePath not found. Verify the Telephony Validator SCIM ' +
          'Sub Resource Type Handler is configured properly for this sample.');
      return Observable.empty();
    }

    body = {
      attributePath: validatedPhoneNumber.attributePath,
      attributeValue: phoneNumber,
      message: VALIDATE_PHONE_NUMBER.MESSAGE,
      messagingProvider: messagingProvider,
      schemas: validatedPhoneNumber.schemas
    };

    o = this.httpWrapper.post(this.getUrl('Me/validatedPhoneNumbers'), JSON.stringify(body));
    o.subscribe(
        (data: any) => this.validatedPhoneNumber.next(this.processRecord(data)),
        this.handleError
    );
    return o;
  }

  validateTelephonyCode(code: string): Observable<any> {
    var validatedPhoneNumber: any, o: Observable<any>;

    validatedPhoneNumber = this.validatedPhoneNumber.getValue();
    if (! validatedPhoneNumber || ! validatedPhoneNumber.attributePath) {
      this.alertService.add('validatedPhoneNumber or attributePath not found. Verify the Telephony Validator SCIM ' +
          'Sub Resource Type Handler is configured properly for this sample.');
      return Observable.empty();
    }

    validatedPhoneNumber = Utility.clone(validatedPhoneNumber);
    validatedPhoneNumber.verifyCode = code;

    o = this.httpWrapper.put(this.getLocation(validatedPhoneNumber), JSON.stringify(validatedPhoneNumber));
    o.subscribe(
        (data: any) => {
          // store the validated number information
          this.validatedPhoneNumber.next(this.processRecord(data));

          // refresh our profile attributes to pickup the number in case it was updated
          this.fetchProfile();
        },
        this.handleError
    );

    return o;
  }

  removeValidatedPhoneNumber(disableSecondFactor: boolean): Observable<any> {
    var profile: Profile, o: Observable<any>;

    // clear the second factor phone attribute
    profile = Utility.clone(this.profile.getValue());
    profile.record.secondFactorPhoneNumber = null;
    o = this.updateProfile(profile);

    // disable second factor if necessary
    if (disableSecondFactor) {
      o = o.flatMap(() => this.toggleSecondFactorEnable(! disableSecondFactor)).share();
    }
    
    // update the validated phone record
    o.subscribe(
        () => this.fetchValidatedPhoneNumber(),
        () => {}
    );

    return o;
  }

  createTotpSharedSecret(): Observable<any> {
    var totpSharedSecret: any, request: any, o: Observable<any>;

    totpSharedSecret = this.totpSharedSecret.getValue();
    if (! totpSharedSecret) {
      this.alertService.add('totpSharedSecret not found. Verify the TOTP Shared Secret SCIM Sub Resource Type ' +
          'Handler is configured properly for this sample.');
      return Observable.empty();
    }

    request = {
      schemas: totpSharedSecret.schemas
    };

    o = this.httpWrapper.post(this.getLocation(totpSharedSecret), JSON.stringify(request));
    o.subscribe(
        (data: any) => this.totpSharedSecret.next(this.processRecord(data)),
        this.handleError
    );
    return o;
  }

  validateTotp(totp: string): Observable<any> {
    var totpSharedSecret: any, o: Observable<any>;

    totpSharedSecret = this.totpSharedSecret.getValue();
    if (! totpSharedSecret || ! totpSharedSecret.sharedSecret) {
      this.alertService.add('totpSharedSecret or sharedSecret not found. Verify the TOTP Shared Secret SCIM Sub ' +
          'Resource Type Handler is configured properly for this sample.');
      return Observable.empty();
    }

    totpSharedSecret = Utility.clone(totpSharedSecret);
    totpSharedSecret.verifyTotp = totp;

    o = this.httpWrapper.put(this.getLocation(totpSharedSecret), JSON.stringify(totpSharedSecret));
    o.subscribe(
        (data: any) => this.totpSharedSecret.next(this.processRecord(data)),
        (err: any) => {
          var error: any;
          // provide a friendly error message if the error is due to incorrect code
          if (totp && err.status === 400) {
            error = HttpWrapper.parseResponse(err);
            if (error && error.scimType === 'invalidValue') {
              err = 'The verify code is incorrect.';
            }
          }
          return this.handleError(err);
        }
    );
    return o;
  }

  removeTotpSharedSecret(disableSecondFactor: boolean): Observable<any> {
    var totpSharedSecret: any, o: Observable<any>;

    totpSharedSecret = this.totpSharedSecret.getValue();
    if (! totpSharedSecret) {
      this.alertService.add('totpSharedSecret not found. Verify the TOTP Shared Secret SCIM Sub Resource Type ' +
          'Handler is configured properly for this sample.');
      return Observable.empty();
    }

    o = this.httpWrapper.delete(this.getLocation(totpSharedSecret));

    // disable second factor if necessary
    if (disableSecondFactor) {
      o = o.flatMap(() => this.toggleSecondFactorEnable(! disableSecondFactor)).share();
    }

    o.subscribe(
        () => this.fetchTotpSharedSecret(),
        this.handleError
    );

    return o;
  }

  getDefaultProviderIconUrl(provider: any): string {
    if (provider.iconUrl) {
      return provider.iconUrl;
    }
    switch (provider.type) {
      case 'facebook':
        return 'dist/img/facebook_32.png';
      case 'google':
        return 'dist/img/google_32.png';
      case 'oidc':
        return 'dist/img/openid_32.png';
    }
    return 'dist/img/generic-app.png';
  }

  private removeSubjectEntry(subject: BehaviorSubject<any[]>, obj: any): Observable<any> {
    var o = this.httpWrapper.delete(this.getLocation(obj));
    o.subscribe(
        () => {
          var objects = subject.getValue();
          objects.splice(objects.indexOf(obj), 1);
          subject.next(objects);
        },
        this.handleError
    );
    return o;
  }

  private getUrl(path: string): string {
    return this.httpWrapper.getResourceServerUrl('scim/v2/' + path);
  }

  private processRecord(record: any): any {
    if (record && record.meta && record.meta.lastModified) {
      record.meta.lastModified = new Date(record.meta.lastModified);
    }
    return record;
  }

  private getLocation(record: any): string {
    return (record && record.meta) ? record.meta.location : undefined;
  }

  private formatError(error: any, details?: string): any {
    var obj: any = {}, message: string;

    // is it a response object?
    error = HttpWrapper.parseResponse(error);
    if (error instanceof ProgressEvent) {
      obj.message = 'Close the browser and reload the application. If you continue to see this error, an ' +
          'administrator should verify the Data Broker CORS configuration.';
      obj.details = 'ProgressEvent';
    }
    else if (error.detail) {
      message = error.detail;
      if (error.scimType || error.status) {
        message += ' (';
        if (error.scimType) {
          message += error.scimType;
        }
        if (error.status) {
          if (error.scimType) {
            message += ', ';
          }
          message += error.status;
          obj.details = '' + error.status;
        }
        message += ')';
      }
      obj.message = message;
    }
    else {
      // otherwise should be string
      obj.message = typeof error === 'string' ? error : 'An error occurred.';
      if (details) {
        obj.details = details;
      }
    }

    return obj;
  }
}