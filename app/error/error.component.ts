/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { RouteSegment } from '@angular/router';

import { ScimService } from '../shared/index';
import { template } from './error.html';

@Component({
  selector: 'ubid-error',
  template: template
})
export class ErrorComponent implements OnInit {
  message: string;
  details: string;

  constructor(private routeSegment: RouteSegment, private scimService: ScimService) {}

  ngOnInit() {
    this.message = this.routeSegment.getParam('message') || this.scimService.error;
    this.details = this.routeSegment.getParam('details');
  }
}
