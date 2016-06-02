export const template = `
<form [ngFormModel]="changePasswordForm"
      (ngSubmit)="changePasswordForm.valid && submit(changePasswordForm.value)"
      autocomplete="off"
      novalidate>

  <ubid-account-breadcrumb>
    <li>
      <a [routerLink]="['/profile']">Profile</a>
    </li>
  </ubid-account-breadcrumb>
  
  <h4>Change Password</h4>

  <div *ngIf="currentPasswordRequired"
       [ngClass]="{ 'has-error': changePasswordForm.controls['currentPassword'].dirty &&
          changePasswordForm.controls['currentPassword'].hasError('required') }"
       class="form-group">
    <label class="control-label required">Current&nbsp;Password </label>
    <input [ngFormControl]="changePasswordForm.controls['currentPassword']"
           #currentPassword="ngForm"
           type="password" placeholder="Enter Current Password" class="form-control input-sm" tabindex="1">
    <div *ngIf="currentPassword.control.dirty && currentPassword.control.hasError('required')"
         class="validation-message">
      Current Password is required.
    </div>
  </div>
  <div [ngClass]="{ 'has-error': changePasswordForm.controls['newPassword'].dirty &&
          (changePasswordForm.controls['newPassword'].hasError('required') ||
          changePasswordForm.hasError('requirements')) }"
       class="form-group">
    <label class="control-label required">New Password </label>
    <input [ngFormControl]="changePasswordForm.controls['newPassword']"
           #newPassword="ngForm"
           type="password" required placeholder="Enter New Password" class="form-control input-sm" tabindex="2">
    <div *ngIf="newPassword.control.dirty && newPassword.control.hasError('required')"
         class="validation-message">
      New Password is required.
    </div>
    <ubid-password-requirements [password]="changePasswordForm.controls['newPassword']"
                                [requirements]="passwordRequirements"></ubid-password-requirements>
  </div>
  <div [ngClass]="{ 'has-error': changePasswordForm.controls['confirmPassword'].dirty &&
          (changePasswordForm.controls['confirmPassword'].hasError('required') ||
          changePasswordForm.hasError('mustMatch')) }"
       class="form-group">
    <label class="control-label required">Confirm&nbsp;Password </label>
    <input [ngFormControl]="changePasswordForm.controls['confirmPassword']"
           #confirmPassword="ngForm"
           type="password" required placeholder="Re-enter New Password" class="form-control input-sm" tabindex="3">
    <div *ngIf="confirmPassword.control.dirty && (confirmPassword.control.hasError('required') ||
            changePasswordForm.hasError('mustMatch'))"
         class="validation-message">
      <span *ngIf="confirmPassword.control.hasError('required')">Confirm Password is required.</span>
      <span *ngIf="changePasswordForm.hasError('mustMatch') &&
                ! confirmPassword.control.hasError('required')">Confirm Password must match New Password.</span>
    </div>
  </div>
  <div class="form-group mtxl mbn">
    <input [disabled]="! changePasswordForm.valid"
           type="submit" class="btn btn-primary" value="Change Password" tabindex="4">
    <button (click)="cancel()"
            type="button" class="btn" tabindex="5">Cancel</button>
  </div>
</form>
`;