export const template = `
<div class="container">
  <div class="row">
    <div class="col-md-12">
      <div class="login-div">
        <div class="login-header">
          <div class="pull-right"><img src="dist/img/white-unbound-orange-id-24.png" alt="UnboundID Logo" /></div>
          {{ title }}
        </div>
        <div class="alerts-panel">
          <div *ngFor="let alert of alerts"
               [ngClass]="alert.getClass()"
               class="alert fade in">
            <button (click)="closeAlert(alert)"
                    class="close">X</button>
            <div class="message">{{ alert.message }}</div>
          </div>
        </div>
        <div class="login-container">

          <ng-content></ng-content>

        </div>
        <div class="login-footer">
          <div class="footer-contents">
            <a [href]="logoutUrl">Sign Out</a>
            <span class="separator">|</span>
            <a (click)="showAbout = true"
               href="javascript:void(0)">Powered by UnboundID Data Broker</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div [style.display]="showAbout ? 'block' : 'none'"
     class="modal fade in ab">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header" style="border:none">
        <button (click)="showAbout = false"
                type="button" class="close">x</button>
      </div>
      <div class="modal-body ab-body">
        <div class="ab-app-logo">
          <img src="dist/img/unboundid-white38.png" alt="UnboundID Logo" width="150" height="38">
        </div>
        <div class="ab-app-name">Data Broker My Account Sample UI</div>
        <div class="ab-app-version"> {{ configuration.version }}</div>
        <div class="ab-contact-info"> UnboundID Corp.
          <br> 13809 Research Blvd, Suite 500
          <br> Austin, TX 78750
          <br> +1 512 600 7700</div>
        <div><a class="ab-email-info" href="mailto:info@unboundid.com">info@unboundid.com</a></div>
      </div>
    </div>
  </div>
</div>
<div *ngIf="showAbout"
     class="modal-backdrop fade in"></div>

<div *ngIf="showLoading"
     class="loading-overlay">
  <span class="fa fa-spinner fa-pulse loading-icon"></span>
</div>
`;