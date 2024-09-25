import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Combat Ship Game';

  constructor() {
    const app = initializeApp(environment.firebase);
    const auth = getAuth(app);
  }
}
