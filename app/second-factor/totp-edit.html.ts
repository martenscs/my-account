export const template = `
<ubid-account-breadcrumb>
  <li>
    <a [routerLink]="['/second-factor']">Second Factor</a>
  </li>
</ubid-account-breadcrumb>

<h4>Configure Time-based One-time Password</h4>

<form (ngSubmit)="validateTotp()"
      autocomplete="off" class="mtl">

  <p class="mbl text-muted">Scan the barcode below with your Time-based One-time Password application to sync it with
    your account.  Alternatively, the secret key can be manually entered.</p>

  <ubid-qr-code
     *ngIf="uri"
     [text]="uri"></ubid-qr-code>

  <p [hidden]="! showSecret"
     class="mtm">{{ secret }}</p>
  
  <div class="mtm">
    <a (click)="showSecret = ! showSecret"
       href="javascript:void(0)"><!--
      --><span *ngIf="! showSecret">Show Key</span><!--
      --><span *ngIf="showSecret">Hide Key</span><!--
    --></a><!--
    --><span class="separator"> | </span><!--
    --><a (click)="createTotpSharedSecret()"
          href="javascript:void(0)">New Key</a>
  </div>

  <div class="form-group mtm">
    <label class="control-label required">Verify Code </label>
    <input [(ngModel)]="totp"
       #totpField="ngModel"
       required
       maxlength="12"
       name="totp"
       type="text" class="form-control input-sm"
       placeholder="Enter the code from your Time-based One-time Password application"
       tabindex="1">
  </div>

  <div style="margin-top:30px">
    <button [disabled]="! totpField.valid"
            type="submit" class="btn btn-primary" tabindex="2">Save</button>
    <a [routerLink]="['/second-factor']"
       class="btn">Cancel</a>
  </div>
</form>
`;