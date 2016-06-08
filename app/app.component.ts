/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Routes, Router } from '@angular/router';

import { IndexComponent } from './index/index';
import { ProfileComponent } from './profile/index';
import { ExternalIdentityListComponent } from './external-identity/index';
import { SessionListComponent } from './session/index';
import { ConsentComponent } from './consent/index';
import { PreferenceComponent } from './preference/index';
import { ErrorComponent } from './error/index';
import { AlertService, LoadingService, HttpWrapper, ScimService, LayoutComponent } from './shared/index';

@Component({
  selector: 'ubid-app',
  template: `
      <ubid-layout [hidden]="! show" [title]="'My Account'">
        <router-outlet></router-outlet>
      </ubid-layout>
    `,
  providers: [ AlertService, LoadingService, HttpWrapper, ScimService ],
  directives: [ LayoutComponent ]
})
@Routes([
  {
    path: '/',
    component: IndexComponent
  },
  {
    path: '/profile',
    component: ProfileComponent
  },
  {
    path: '/external-identity',
    component: ExternalIdentityListComponent
  },
  {
    path: '/session',
    component: SessionListComponent
  },
  {
    path: '/consent',
    component: ConsentComponent
  },
  {
    path: '/preference',
    component: PreferenceComponent
  },
  {
    path: '/error',
    component: ErrorComponent
  }
])
export class AppComponent implements OnInit, OnDestroy {

  private window: Window;
  private routeSubscription: any;
  private errorSubscription: any;

  show: boolean;

  constructor(@Inject(Window) window: Window, private router: Router, private alertService: AlertService,
              private scimService: ScimService) {
    this.window = window;
  }
  
  ngOnInit() {
    // clear the alerts on route change
    this.routeSubscription = this.router.changes.subscribe(() => this.alertService.clear());
    
    // route to error on critical error
    this.errorSubscription = this.scimService.criticalError$.subscribe((err: any) => {
      if (err) {
        this.router.navigate([ '/error' ])
      }
    });

    // navigate to the appropriate initial view
    var route = '/';
    if (this.scimService.isIdpCallback) {
      route = '/external-identity';
    }
    else if (this.scimService.error) {
      route = '/error';
    }
    this.router.navigate([ route ]);

    // only show the layout/page if the SCIM service initialized (i.e. did not redirect for access token)
    this.show = this.scimService.initialized;
  }

  ngOnDestroy() {
    if (this.routeSubscription && this.routeSubscription.unsubscribe) {
      this.routeSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }
}