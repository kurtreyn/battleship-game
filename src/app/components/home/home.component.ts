import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractGame } from '../../shared/game/abstractGame'
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { IPlayer } from 'src/app/models/game';
import { Subscription, BehaviorSubject } from 'rxjs';
import { GAME } from 'src/app/enums/enums';
import { take, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends AbstractGame {
  hasAccountMessage: string = 'Already have an account? Click here to login';
  doesNotHaveAccountMessage: string = 'Don\'t have an account? Click here to register';


  constructor(
    public gameService: GameService,
    public dataService: DataService,
    public authService: AuthService,
    public subscriptionService: SubscriptionService,
    public boardService: BoardService,
  ) {
    super(gameService, dataService, authService, subscriptionService, boardService)
  }

  toggleShowLogin(): void {
    this.showLogin = !this.showLogin;
  }

  toggleShowModal(): void {
    this.showModal = !this.showModal;
  }



}