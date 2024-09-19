import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reg-form',
  templateUrl: './reg-form.component.html',
  styleUrls: ['./reg-form.component.css']
})
export class RegFormComponent {
  email: string = ''
  name: string = ''
  password: string = ''
  @Output() onReg = new EventEmitter<boolean>();

  constructor(
    private _authService: AuthService
  ) { }


  register() {
    if (this.email === '') {
      alert('Please enter your email')
      return
    }
    if (this.name === '') {
      alert('Please enter your name')
      return
    }
    if (this.password === '') {
      alert('Please enter your password')
      return
    }
    this._authService.register(this.email, this.password, this.name)
    this.email = ''
    this.password = ''
    this.name = ''
    this.onReg.emit(true);
  }


}
