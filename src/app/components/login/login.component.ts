import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = ''
  password: string = ''
  @Output() onLogin = new EventEmitter<boolean>();

  constructor(
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  login() {
    if (this.email === '') {
      alert('Please enter your email')
      return
    }
    if (this.password === '') {
      alert('Please enter your password')
      return
    }
    this._authService.login(this.email, this.password)
    this.email = ''
    this.password = ''
    this.onLogin.emit(true);
  }


}