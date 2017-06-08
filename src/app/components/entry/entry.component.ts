import { Component } from '@angular/core';

import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-root',
  template: `
      <router-outlet class="container"></router-outlet>
    `,
  styleUrls: ['../../../assets/css/main.css']
})

export class EntryComponent {

}
