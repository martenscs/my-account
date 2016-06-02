/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import { AlertService, HttpWrapper, LoadingService, Utility, Profile } from '../index';


const STORAGE_KEY: any = {
  FLOW_STATE: 'my_account_flow_state',
  ACCESS_TOKEN: 'my_account_access_token'
};


@Injectable()
export class ScimService {

  private window: Window;

  public initialized: boolean = false;

  public error: string;
  
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

  private handleError = (err: Response) => this.alertService.add(err);

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
        this.httpWrapper.bearerToken = params['access_token'];
        // TODO: validate state and nonce
      }
      else if (params['error']) {
        this.error = (params['error_description'] ?
          params['error_description'] + ' (' + params['error'] + ')' :
          params['error']).replace(/\+/g, ' ');
      }
      else {
        this.error = 'Unexpected OAuth callback parameters';
      }
    }
    else {
      // redirect for access token
      // TODO: store state and nonce for later validation
      var state = Utility.getRandomInt(0, 999999);
      var nonce = Utility.getRandomInt(0, 999999);
      var uri = this.httpWrapper.getAuthorizeUrl(state, nonce);
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
    // lazy-load the sessions
    if (! this.sessions.getValue()) {
      this.fetchSessions();
    }
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

  fetchProfile(): Observable<Profile> {
    var o = this.httpWrapper.get(this.getUrl('Me'));
    o.subscribe((data: any) => this.profile.next(new Profile(data)),
        this.handleError);
    return o
  }

  fetchPasswordQualityRequirements(): Observable<any> {
    var o = this.httpWrapper.get(this.getUrl('Me/passwordQualityRequirement'));
    o.subscribe((data: any) => this.passwordQualityRequirements.next(data),
        this.handleError);
    return o;
  }

  fetchSessions(): Observable<any[]> {
    var o = this.httpWrapper.get(this.getUrl('Me/session'));
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
    return o
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
    return o
  }

  fetchExternalIdentities(): Observable<any[]> {
    var o = this.httpWrapper.get(this.getUrl('Me/externalIdentities'));
    o.subscribe(
        (data: any) => this.externalIdentities.next(data.Resources),
        this.handleError
    );
    return o
  }

  updateProfile(profile: Profile): Observable<any> {
    var o = this.httpWrapper.put(Profile.getLocation(profile), JSON.stringify(Profile.toScim(profile)));
    o.subscribe((data: any) => this.profile.next(new Profile(data)),
        this.handleError);
    return o;
  }

  changePassword(newPassword: string, currentPassword?: string): Observable<any> {
    var data: any = {
      schemas: [ 'urn:unboundid:scim:api:messages:2.0:PasswordUpdateRequest' ],
      newPassword: newPassword,
      currentPassword: currentPassword
    };
    var o = this.httpWrapper.put(this.getUrl('Me/password'), JSON.stringify(data));
    o.subscribe(() => {},
        this.handleError);
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

    var o = this.httpWrapper.put(flowState.meta.location, JSON.stringify(data));
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
      callbackUrl: this.httpWrapper.getUrl('callback.html')
    };

    var o = this.httpWrapper.put(externalIdentity.meta.location, JSON.stringify(data));
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
    var o = this.httpWrapper.delete(externalIdentity.meta.location);
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
    var o = this.httpWrapper.delete(obj.meta.location);
    o.subscribe(
        () => {
          var objects = subject.getValue();
          objects.splice(objects.indexOf(obj));
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
}