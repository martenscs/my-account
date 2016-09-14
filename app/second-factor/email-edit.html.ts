export const template = `
<ubid-account-breadcrumb>
  <li>
    <a [routerLink]="['/second-factor']">Second Factor</a>
  </li>
</ubid-account-breadcrumb>

<h4>Configure Email Code</h4>

<p class="text-muted mbl">Enter the delivery address that we will use when sending you verification codes.</p>
  
<form (ngSubmit)="verifyEmailAddress()"
      autocomplete="off">

  <div class="form-group">
    <label class="control-label required">Delivery Address </label>
    <input [(ngModel)]="emailAddress"
           #emailField="ngModel"
           required
           maxlength="256"
           name="emailAddress"
           pattern="[^@\\s]+@[^@\\s]+\\.[^@\\s]+"
           type="email" class="form-control input-sm" placeholder="Enter Email Address" tabindex="1">
    <div [hidden]="emailField.valid || emailField.pristine"
         class="validation-message">
      <div [hidden]="! emailField.errors || ! emailField.errors.required">
        Delivery Address is required.
      </div>
      <div [hidden]="! emailField.errors || ! emailField.errors.pattern">
        Delivery Address is invalid.
      </div>
    </div>
  </div>

  <div *ngIf="! showCode"
       style="margin-top:30px">
    <button [disabled]="! emailField.valid"
            type="submit" class="btn btn-primary" tabindex="2">Verify Delivery Address</button>
    <a [routerLink]="['/second-factor']"
       class="btn">Cancel</a>
  </div>
</form>

<form (ngSubmit)="verifyCode()"
      [hidden]="! showCode"
      autocomplete="off">

  <div class="form-group">
    <label class="control-label required">Verify Code </label>
    <div class="row">
      <div class="col-md-6">
        <input [(ngModel)]="code"
               #codeField="ngModel"
               required
               maxlength="12"
               name = "code"
               type="text" class="form-control input-sm" placeholder="Enter the code we sent to the Delivery Address"
               tabindex="3">
      </div>
    </div>
    <div [hidden]="codeField.valid || codeField.pristine"
         class="validation-message">
      Verify Code is required.
    </div>
  </div>
 
  <div style="margin-top:30px">
    <button [disabled]="! codeField.valid"
            type="submit" class="btn btn-primary" tabindex="4">Save</button>
    <a [routerLink]="['/second-factor']"
       (click)="cancel()"
       class="btn">Cancel</a>
  </div>
</form>
`;