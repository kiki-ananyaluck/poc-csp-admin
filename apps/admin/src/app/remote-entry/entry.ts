import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-admin-entry',
  template: `<router-outlet></router-outlet>`,
})
export class RemoteEntry {}
