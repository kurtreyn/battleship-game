import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { IPlayer } from 'src/app/models/game';
import { Subscription } from 'rxjs';
import { GAME } from 'src/app/enums/enums';
import { take } from 'rxjs/operators';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  hasAccountMessage: string = 'Already have an account? Click here to login';
  doesNotHaveAccountMessage: string = 'Don\'t have an account? Click here to register';
  showLogin: boolean = false;
  showLobby: boolean = false;
  activePlayers?: IPlayer[];
  isLoggedIn: boolean = false;
  player?: IPlayer
  opponent?: IPlayer
  gameStarted: boolean = true;
  gameCompleted: boolean = false;
  winningScore: number = GAME.WINNING_SCORE;

  private _playerSubscription!: Subscription;
  private _opponentSubscription!: Subscription;
  private _activePlayersSubscription!: Subscription;
  private _currentUserSubscription!: Subscription;


  constructor(
    private _gameService: GameService,
    private _dataService: DataService,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this._subscribeToPlayerUpdates();
    this._getActivePlayers();
    this._getCurrentUser();
  }

  ngOnDestroy(): void {
    this._playerSubscription.unsubscribe();
    this._opponentSubscription.unsubscribe();
    this._activePlayersSubscription.unsubscribe();
    this._currentUserSubscription.unsubscribe();
  }

  toggleShowLogin(): void {
    this.showLogin = !this.showLogin
  }

  onLoginOrRegEvent(event: boolean): void {
    if (event) {
      this.showLogin = false;
      this.showLobby = true;
    }
  }

  private _getCurrentUser(): void {
    this._currentUserSubscription = this._authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.showLobby = true;
        this._dataService.getAllPlayers().pipe(
          take(1)
        ).subscribe(players => {
          const player = players.find(player => player.playerId === user.uid);
          if (player) {
            this._gameService.setPlayer(player);
          }
        });
      } else {
        console.log('no user');
      }
    });
  }

  private _getActivePlayers(): void {
    this._activePlayersSubscription = this._dataService.getAllPlayers().subscribe(players => {
      if (players) {
        const activePlayers = players.filter(player => player.isActive === true);
        this.activePlayers = activePlayers;
        console.log('active players', this.activePlayers);
      }
    });
  }

  private _subscribeToPlayerUpdates(): void {
    this._playerSubscription = this._gameService.player$.subscribe(player => {
      console.log('player', player);
      if (player) {
        this.player = player
        // console.log('THIS.PLAYER', this.player);

        if (this.player && this.opponent) {
          if (this.player.isReady && this.opponent.isReady) {
            this.gameStarted = true;
          }

          if (this.player.score === this.winningScore || this.opponent.score === this.winningScore) {
            this.gameCompleted = true;
          }
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
