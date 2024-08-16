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

  constructor(private fireauth: AngularFireAuth, private dataService: DataService, private router: Router) { }


  login(email: string, password: string) {
    this.fireauth.signInWithEmailAndPassword(email, password).then((res) => {
      localStorage.setItem('token', 'true')
      // if (res.user?.emailVerified === true) {
      //   this.router.navigate(['/dashboard'])
      // } else {
      //   this.router.navigate(['/verify-email'])
      // }
    }, err => {
      alert('Something went wring' + err.message)
      this.router.navigate(['/login'])
    })
  }

  register(email: string, password: string, name: string) {
    this.fireauth.createUserWithEmailAndPassword(email, password).then((res) => {
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
        playerNumber: 0
      };
      this.dataService.addPlayer(this.player);
      // this.router.navigate(['/login'])
      // this.sendEmailForVerification(res.user)
    }, err => {
      alert('Something went wring')
      // this.router.navigate(['/register'])
    })
  }


  logout() {
    this.fireauth.signOut().then(() => {
      localStorage.removeItem('token')
      this.router.navigate(['/login'])
    }, err => {
      alert('Something went wring' + err.message)
    })
  }

  forgotPassword(email: string) {
    this.fireauth.sendPasswordResetEmail(email).then(() => {
      alert('Password reset link sent')
      this.router.navigate(['/verify-email'])
    }, err => {
      alert('Something went wring' + err.message)
      this.router.navigate(['/forgot-password'])
    })
  }

  sendEmailForVerification(user: any) {
    user.sendEmailVerification().then((res: any) => {
      this.router.navigate(['/verify-email'])
    }, (err: any) => {
      alert('Something went wring' + err.message)
    })
  }
}