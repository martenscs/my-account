/**
 * Copyright 2016-2017 Ping Identity Corporation
 * All Rights Reserved.
 */

import { Injectable, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';


enum IdentityProviderTypes { Broker, PingFederate }


// NOTE: Override these for local development (examples below).
export const IDENTITY_PROVIDER_URL = '/';
export const CLIENT_REDIRECT_URL = '/samples/my-account/callback.html';
//export const IDENTITY_PROVIDER_URL = 'https://localhost:8445/';
//export const CLIENT_REDIRECT_URL = 'http://localhost:3004/callback.html';

// NOTE: Override this when the IDP and resource server are not a single Data Governance Broker instance.
export const RESOURCE_SERVER_URL = IDENTITY_PROVIDER_URL;

// NOTE: Override this when using PingFederate as the IDP (example below).
const IDENTITY_PROVIDER_TYPE = IdentityProviderTypes.Broker;
//const IDENTITY_PROVIDER_TYPE = IdentityProviderTypes.PingFederate;


const IDENTITY_PROVIDER_CONFIG: any = {};
// Broker IDP configuration (revoke is not required since logout endpoint handles it)
IDENTITY_PROVIDER_CONFIG[IdentityProviderTypes.Broker] = {
  AUTH_ENDPOINT: 'oauth/authorize',
  LOGOUT_ENDPOINT: 'oauth/logout'
};
// PingFederate IDP configuration
IDENTITY_PROVIDER_CONFIG[IdentityProviderTypes.PingFederate] = {
  AUTH_ENDPOINT: 'as/authorization.oauth2',
  REVOKE_ENDPOINT: 'as/revoke_token.oauth2',
  LOGOUT_ENDPOINT: 'idp/startSLO.ping'
};


export const CLIENT_ID = '@my-account@';

export const URN_PREFIX = 'urn:pingidentity:';

export const SCOPES = URN_PREFIX + 'scope:manage_profile ' +
    URN_PREFIX + 'scope:password_quality_requirements ' +
    URN_PREFIX + 'scope:change_password ' +
    URN_PREFIX + 'scope:manage_external_identities ' +
    URN_PREFIX + 'scope:manage_sessions ' +
    URN_PREFIX + 'scope:manage_consents ' +
    URN_PREFIX + 'scope:validate_email_address ' +
    URN_PREFIX + 'scope:validate_phone_number ' +
    URN_PREFIX + 'scope:manage_totp';

export const ACR_VALUES = ''; // if no values are specified the defaults will be used

export const PHONE_MESSAGING_PROVIDERS = {
  SMS: 'Twilio SMS Provider',
  VOICE: 'Twilio Voice Provider'
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

  get isBrokerIdp(): boolean {
    return IDENTITY_PROVIDER_TYPE === IdentityProviderTypes.Broker;
  }

  get isPingFederateIdp(): boolean {
    return IDENTITY_PROVIDER_TYPE === IdentityProviderTypes.PingFederate;
  }

  get idpConfig(): any {
    return IDENTITY_PROVIDER_CONFIG[IDENTITY_PROVIDER_TYPE];
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
