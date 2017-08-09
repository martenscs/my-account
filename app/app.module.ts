/**
 * Copyright 2016-2017 Ping Identity Corporation
 * All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LayoutComponent, BreadCrumbComponent, ConfirmComponent, AddressPipe, CapitalizePipe, ElapsedTimePipe,
    AlertService, LoadingService, HttpWrapper, ScimService } from './shared/index'
import { IndexComponent } from './index/index';
import { ProfileComponent, ProfileViewComponent, ProfileEditComponent, ChangePasswordComponent } from './profile/index';
import { PreferenceComponent, PreferenceViewComponent, CommunicationContentEditComponent,
    TopicEditComponent } from './preference/index';
import { ErrorComponent } from './error/index';
import { Configuration } from './app.config';
import { ROUTES } from './app.routes';


@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AppComponent,
    LayoutComponent,
    BreadCrumbComponent,
    ConfirmComponent,
    IndexComponent,
    ProfileComponent,
    ProfileViewComponent,
    ProfileEditComponent,
    ChangePasswordComponent,
    PreferenceComponent,
    PreferenceViewComponent,
    CommunicationContentEditComponent,
    TopicEditComponent,
    ErrorComponent,
    AddressPipe,
    CapitalizePipe,
    ElapsedTimePipe
  ],
  bootstrap: [ AppComponent ],
  providers: [
    { provide: Window, useValue: window },
    Configuration,
    AlertService,
    LoadingService,
    HttpWrapper,
    ScimService
  ]
})
export class AppModule { }
