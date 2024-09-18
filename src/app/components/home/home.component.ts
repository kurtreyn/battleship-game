import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { IPlayer } from 'src/app/models/game';
import { Subscription } from 'rxjs';
import { GAME } from 'src/app/enums/enums';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  showLogin: boolean = false;
  hasAccountMessage: string = 'Already have an account? Click here to login';
  doesNotHaveAccountMessage: string = 'Don\'t have an account? Click here to register';
  player?: IPlayer
  opponent?: IPlayer
  gameStarted: boolean = true;
  gameCompleted: boolean = false;
  winningScore: number = GAME.WINNING_SCORE;

  private _playerSubscription!: Subscription;
  private _opponentSubscription!: Subscription;


  constructor(private _gameService: GameService) { }

  ngOnInit(): void {
    this._subscribeToPlayerUpdates();
  }

  ngOnDestroy(): void {
    this._playerSubscription.unsubscribe();
    this._opponentSubscription.unsubscribe();
  }

  toggleShowLogin(): void {
    this.showLogin = !this.showLogin
  }

  private _subscribeToPlayerUpdates(): void {
    this._playerSubscription = this._gameService.player$.subscribe(player => {
      if (player && this.opponent) {
        this.player = player
        console.log('player', this.player);
        if (this.player.isReady && this.opponent.isReady) {
          this.gameStarted = true;
        }

        if (this.player.score === this.winningScore || this.opponent.score === this.winningScore) {
          this.gameCompleted = true;
        }
      };
    });

    this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
      if (opponent) {
        this.opponent = opponent
        // console.log('opponent', this.opponent);
      };
    });
  }
}
