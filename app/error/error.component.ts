/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { RouteSegment } from '@angular/router';

import { Configuration, ScimService } from '../shared/index';
import { template } from './error.html';

@Component({
  selector: 'ubid-error',
  template: template
})
export class ErrorComponent implements OnInit {
  message: string;
  details: string;

  accessDenied: boolean;
  requestAccessUrl: string;
  
  constructor(private routeSegment: RouteSegment, private configuration: Configuration,
              private scimService: ScimService) {}

  ngOnInit() {
    this.message = this.routeSegment.getParam('message') ||
        (this.scimService.error ? this.scimService.error.message : undefined);
    this.details = this.routeSegment.getParam('details') ||
        (this.scimService.error ? this.scimService.error.details : undefined);

    this.accessDenied = this.details === 'access_denied' || this.details === '401';
    this.requestAccessUrl = this.configuration.basePath;
  }
}
