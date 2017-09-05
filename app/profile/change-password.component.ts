/**
 * Copyright 2016-2017 Ping Identity Corporation
 * All Rights Reserved.
 */

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Utility, ScimService } from '../shared/index'
import { template } from './change-password.html';

@Component({
  selector: 'ubid-change-password',
  template: template
})
export class ChangePasswordComponent implements OnInit, AfterViewInit {

  @ViewChild('newPassword') newPassword: FormControl;

  changePasswordForm: FormGroup;

  constructor(private builder: FormBuilder, private router: Router, private scimService: ScimService) {}

  ngOnInit(){
    var config: any = {
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required]
    };
    this.changePasswordForm = <FormGroup> this.builder.group(
        config,
        { validator: this.validateForm() }
    )
  }

  ngAfterViewInit() {
    Utility.focus(this.newPassword);
  }

  validateForm() {
    return (group: FormGroup): {[key: string]: any} => {
      var errors: any;
      if (group.controls['newPassword'].value !== group.controls['confirmPassword'].value) {
        errors = {
          mustMatch: true
        };
      }
      return errors;
    }
  }

  submit(value: any) {
    // on success, go back to view (error handled by service)
    this.scimService.changePassword(value.newPassword)
        .subscribe(
            () => this.router.navigate(['/profile']),
            () => {}
        );
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
}