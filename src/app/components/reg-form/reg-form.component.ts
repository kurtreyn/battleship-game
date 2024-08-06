import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reg-form',
  templateUrl: './reg-form.component.html',
  styleUrls: ['./reg-form.component.css']
})
export class RegFormComponent {
  email: string = ''
  password: string = ''

  constructor(private auth: AuthService) { }


  register() {
    if (this.email === '') {
      alert('Please enter your email')
      return
    }
    if (this.password === '') {
      alert('Please enter your password')
      return
    }
    this.auth.register(this.email, this.password)
    this.email = ''
    this.password = ''
  }
}
