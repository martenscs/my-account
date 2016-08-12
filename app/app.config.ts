/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Injectable, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';


// NOTE: Override these for local development (examples below).
export const IDENTITY_PROVIDER_URL = '/';
export const CLIENT_REDIRECT_URL = '/samples/my-account/callback.html';
//export const IDENTITY_PROVIDER_URL = 'https://localhost:8445/';
//export const CLIENT_REDIRECT_URL = 'http://localhost:3004/callback.html';

export const RESOURCE_SERVER_URL = IDENTITY_PROVIDER_URL;

export const CLIENT_ID = '@my-account@';

export const SCOPES = 'urn:unboundid:scope:manage_profile ' +
    'urn:unboundid:scope:password_quality_requirements ' +
    'urn:unboundid:scope:change_password ' +
    'urn:unboundid:scope:manage_external_identities ' +
    'urn:unboundid:scope:manage_sessions ' +
    'urn:unboundid:scope:manage_consents ' +
    'urn:unboundid:scope:validate_email_address ' +
    'urn:unboundid:scope:validate_phone_number ' +
    'urn:unboundid:scope:manage_totp';

export const ACR_VALUES = ''; // if no values are specified the defaults will be used

export const VALIDATE_EMAIL_ADDRESS: any = {
  SUBJECT: 'UnboundID Data Broker Verify Code',
  TEXT: 'Your delivery address verify code is %code%'
};

export const VALIDATE_PHONE_NUMBER: any = {
  MESSAGE: {
    message: 'UnboundID Data Broker Verify Code: %code%',
    language: 'en-US'
  },
  MESSAGING_PROVIDERS: {
    SMS: 'Twilio SMS Provider',
    VOICE: 'Twilio Voice Provider'
  }
};


@Injectable()
export class Configuration {
  private window: Window;
  private _basePath: string;
  private _version: string = 'UNKNOWN';

  get basePath(): string {
    return this._basePath;
  }

  get version(): string {
    return this._version;
  }

  constructor(@Inject(Window) window: Window, private http: Http) {
    this.window = window;
    this.init();
  }

  private init() {
    // determine the base path
    var loc = this.window.location;
    this._basePath = loc.protocol + '//' + loc.host +
        (loc.pathname ? loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1) : '/');

    // read the version from the package.json file
    this.http.get(this._basePath + 'package.json')
        .map((res:Response) => res.json())
        .subscribe((data:any) => {
              this._version = data.version;
            }, () => {});
  }
}
