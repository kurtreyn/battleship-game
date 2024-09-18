import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DataService } from './data.service';

import { IPlayer } from '../models/game';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  player?: IPlayer;

  constructor(private _fireauth: AngularFireAuth, private _dataService: DataService, private _router: Router) { }


  login(email: string, password: string) {
    this._fireauth.signInWithEmailAndPassword(email, password).then((res) => {
      console.log('email', res.user?.email)
      localStorage.setItem('token', 'true')
      console.log('res', res)
      // if (res.user?.emailVerified === true) {
      //   // this._router.navigate(['/dashboard'])
      //   console.log('login successful')
      // } else {
      //   // this._router.navigate(['/verify-email'])
      // }
    }, err => {
      alert('Something went wring' + err.message)
      // this._router.navigate(['/login'])
      console.log('login failed')
    })
  }

  register(email: string, password: string, name: string) {
    this._fireauth.createUserWithEmailAndPassword(email, password).then((res) => {
      alert('Registration successful');
      this.player = {
        playerId: res.user?.uid || '',
        email: email,
        name: name,
        isTurn: false,
        isWinner: false,
        score: 0,
        isReady: false,
        isActive: false,
        readyToEnterGame: false
      };
      this._dataService.addPlayer(this.player);
      // this.router.navigate(['/login'])
      // this.sendEmailForVerification(res.user)
    }, err => {
      alert('Something went wring')
      // this.router.navigate(['/register'])
    })
  }


  logout() {
    this._fireauth.signOut().then(() => {
      localStorage.removeItem('token')
      // this._router.navigate(['/login'])
      alert('Sign out successful')
    }, err => {
      alert('Something went wring' + err.message)
    })
  }

  forgotPassword(email: string) {
    this._fireauth.sendPasswordResetEmail(email).then(() => {
      alert('Password reset link sent')
      this._router.navigate(['/verify-email'])
    }, err => {
      alert('Something went wring' + err.message)
      this._router.navigate(['/forgot-password'])
    })
  }

  sendEmailForVerification(user: any) {
    user.sendEmailVerification().then((res: any) => {
      this._router.navigate(['/verify-email'])
    }, (err: any) => {
      alert('Something went wring' + err.message)
    })
  }
}