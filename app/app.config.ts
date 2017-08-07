/**
 * Copyright 2016-2017 Ping Identity Corporation
 * All Rights Reserved.
 */

import { Injectable, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';


// NOTE: Override these for local development (examples below).

export const IDENTITY_PROVIDER_URL = 'https://my-pingfed-server:9031'; // https://[ping-federate-hostname]:[oath-port]
export const CLIENT_REDIRECT_URL = 'samples/account-manager/callback.html'; // https://[data-governance-hostname]:[https-port]/callback.html
export const RESOURCE_SERVER_URL = 'https://my-broker-server:8443'; // https://[data-governance-hostname]:[https-port]
export const CLIENT_ID = '@account-manager@';

export const IDENTITY_PROVIDER_AUTH_ENDPOINT = 'as/authorization.oauth2';
export const IDENTITY_PROVIDER_LOGOUT_ENDPOINT = '/idp/startSLO.ping';

export const URN_PREFIX = 'urn:pingidentity:';

export const SCOPES = URN_PREFIX + 'scope:manage_profile ' +
    URN_PREFIX + 'scope:change_password ';


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
