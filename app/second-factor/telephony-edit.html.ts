export const template = `
<ubid-account-breadcrumb>
  <li>
    <a [routerLink]="['/second-factor']">Second Factor</a>
  </li>
</ubid-account-breadcrumb>

<h4>Configure Phone Code</h4>

<p class="text-muted mbl">Enter the delivery number that we will use when sending you verification codes.</p>
  
<form (ngSubmit)="verifyPhoneNumber()"
      autocomplete="off">

  <div class="form-group">
    <label class="control-label required">Delivery Number </label>
    <input [(ngModel)]="phoneNumber"
           #phoneField="ngModel"
           required
           name="phoneNumber"
           type="tel" class="form-control input-sm" placeholder="Enter Phone Number" tabindex="1">
    <div [hidden]="phoneField.valid || phoneField.pristine"
         class="validation-message">
      Delivery Number is required.
    </div>
  </div>
  
  <div class="radio mln mtl">
    <label>
      <input [checked]="messagingProvider === validatePhoneNumberConfig.MESSAGING_PROVIDERS.SMS"
             (change)="messagingProvider = validatePhoneNumberConfig.MESSAGING_PROVIDERS.SMS"
             type="radio">
      Send me a text message
    </label>
  </div>
  
  <div class="radio mln">
    <label>
      <input [checked]="messagingProvider === validatePhoneNumberConfig.MESSAGING_PROVIDERS.VOICE"
             (change)="messagingProvider = validatePhoneNumberConfig.MESSAGING_PROVIDERS.VOICE"
             type="radio">
      Call me and read me a code
    </label>
  </div>

  <div *ngIf="! showCode"
       style="margin-top:30px">
    <button [disabled]="! phoneField.valid"
            type="submit" class="btn btn-primary" tabindex="2">Verify Delivery Number</button>
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
               name="code"
               type="text" class="form-control input-sm" placeholder="Enter the code we sent to the Delivery Number"
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