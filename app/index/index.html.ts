export const template = `
<div *ngIf="profile"
     class="card lg clearfix mbxl">
  <img [src]="profile.photoUrl || 'dist/img/placeholder-user.png'"
       [alt]="profile.fullName"
       class="pull-left mrm">
  <div class="pull-left">
    <div class="name">{{ profile.fullName }}</div>
    <div class="detail text-muted">{{ profile.record.userName }}</div>
  </div>
</div>

<a [routerLink]="['/profile']"
   class="account-section">
  <div class="title">Profile</div>
  <p class="blurb">Edit your profile information or change your password.</p>
</a>

<a *ngIf="isBrokerIdp"
   [routerLink]="['/second-factor']"
   class="account-section">
  <div class="title">Second Factor Authentication</div>
  <p class="blurb">Enable or disable second factor authentication and configure verification methods.</p>
</a>

<a *ngIf="isBrokerIdp"
   [routerLink]="['/external-identity']"
   class="account-section">
  <div class="title">Linked Accounts</div>
  <p class="blurb">Link your social media accounts for more personalized offers and the ability to log in with your social account's username and password.</p>
</a>

<a *ngIf="isBrokerIdp"
   [routerLink]="['/session']"
   class="account-section">
  <div class="title">Sessions</div>
  <p class="blurb">View or remove active sessions for browsers that accessed your account without signing out.</p>
</a>

<a *ngIf="isBrokerIdp"
   [routerLink]="['/consent']"
   class="account-section">
  <div class="title">Consent</div>
  <p class="blurb">View or remove applications that have access to your profile information.</p>
</a>

<a [routerLink]="['/preference']"
   class="account-section">
  <div class="title">Communication Preferences</div>
  <p class="blurb">Choose how we communicate with you and the topics that interest you.</p>
</a>
`;