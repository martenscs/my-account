export const template = `
<div *ngIf="! accessDenied"
     class="page-message">
  <div class="page-message-icon error"><span class="glyphicon glyphicon-exclamation-sign"></span></div>
  <div class="page-message-contents">
    <h3>An Error Occurred</h3>
    <p>{{ message }}</p>
    <a *ngIf="details"
       (click)="showDetails = ! showDetails"
       href="javascript:void(0)"><!--
      --><span *ngIf="! showDetails">View Details</span><!--
      --><span *ngIf="showDetails">Hide Details</span><!--
    --></a>
    <div *ngIf="showDetails" class="mtm">
      {{ details }}
    </div>
  </div>
</div>
<div *ngIf="accessDenied"
     class="page-message">
  <div class="page-message-icon warn"><span class="glyphicon glyphicon-warning-sign"></span></div>
  <div class="page-message-contents">
    <div *ngIf="details === 'access_denied'">
      <h3>Access to Account Information Required</h3>
      <p>This application requires the requested access to your account information in order to function.  If you would
      like to use this application, click the link below and accept the access request.</p>
    </div>
    <div *ngIf="details === '401'">
      <h3>Access Unauthorized</h3>
      <p>This application is no longer authorized to access your account information.  Possible causes of this are the
      revocation of this application's consent or the revocation or expiration of its access token.  If you would like
      to continue using this application, click the link below to reauthorize.</p>
    </div>
    <a [href]="requestAccessUrl">Request Access</a>
  </div>
</div>
`;