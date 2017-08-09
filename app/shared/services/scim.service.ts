/**
 * Copyright 2016-2017 Ping Identity Corporation
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

import { AlertService, HttpWrapper, LoadingService, Utility, Profile,
    URN_PREFIX } from '../index';


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

  private profile: BehaviorSubject<Profile> = new BehaviorSubject(undefined);
  private _profile$: Observable<Profile> = this.profile.asObservable();


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
    }
    return this._profile$;
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

  changePassword(newPassword: string): Observable<any> {
    var profile = this.profile.getValue();
    profile.record.password = newPassword;
    var o = this.updateProfile(profile);
    o.subscribe(() => {},
        this.handleError);
    return o;
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
          'administrator should verify the Data Governance Broker CORS configuration.';
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
