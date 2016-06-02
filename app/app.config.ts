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

export const SCOPES = 'openid ' +
    'urn:unboundid:scope:manage_account';


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