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
<a [routerLink]="['/preference']"
   class="account-section">
  <div class="title">Communication Preferences</div>
  <p class="blurb">Choose how we communicate with you and the topics that interest you.</p>
</a>
`;