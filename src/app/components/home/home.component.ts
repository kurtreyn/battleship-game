import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
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
  showModal: boolean = false;
  modalMessage: string = 'Welcome to Battleship!';
  challengerId: string = '';
  requestId: string = '';

  private _playerSubscription!: Subscription;
  private _opponentSubscription!: Subscription;
  private _activePlayersSubscription!: Subscription;
  private _currentUserSubscription!: Subscription;
  private _requestsSubscription!: Subscription;


  constructor(
    private _gameService: GameService,
    private _dataService: DataService,
    private _authService: AuthService,
    private _boardService: BoardService
  ) { }

  ngOnInit(): void {
    this._subscribeToPlayerUpdates();
    this._getActivePlayers();
    this._getCurrentUser();
    this._subscribeToRequests();
  }

  ngOnDestroy(): void {
    this._playerSubscription.unsubscribe();
    this._opponentSubscription.unsubscribe();
    this._activePlayersSubscription.unsubscribe();
    this._currentUserSubscription.unsubscribe();
    this._requestsSubscription.unsubscribe();
  }

  toggleShowLogin(): void {
    this.showLogin = !this.showLogin
  }

  toggleShowModal(): void {
    console.log('show modal');
    this.showModal = !this.showModal;
  }

  onChallengeResponseEvent(response: boolean): void {
    this.showModal = false;
    const responded = true;
    if (response) {
      const challenger = this.activePlayers?.find(player => player.playerId === this.challengerId);
      const challengerId = challenger?.id;
      this._dataService.respondToRequest(this.requestId, responded, response);
      if (challengerId) {
        this._dataService.getIndividualPlayer(challengerId).pipe(
          take(1)
        ).subscribe(opponent => {
          if (opponent) {
            const opponentData = {
              ...opponent,
              isReady: false,
              score: 0,
              readyToEnterGame: true,
              session: this.requestId
            } as IPlayer;
            this._gameService.updateOpponent(opponentData);
          }
        });
      }
      const updatedPlayerData = {
        ...this.player,
        readyToEnterGame: true,
        session: this.requestId
      } as IPlayer;
      this._gameService.updatePlayer(updatedPlayerData);
    } else {
      this._dataService.respondToRequest(this.requestId, responded, response);
    }
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
        const activePlayers = players.filter(player => player.isActive === true && player.playerId !== this.player?.playerId);
        this.activePlayers = activePlayers;
        console.log('active players', this.activePlayers);
      }
    });
  }

  private _subscribeToPlayerUpdates(): void {
    this._playerSubscription = this._gameService.player$.subscribe(player => {
      // console.log('player', player);
      if (player) {
        this.player = player
        // console.log('THIS.PLAYER', this.player);

        if (this.player) {

          if (this.player.readyToEnterGame) {
            this.showLobby = false;
            this.gameStarted = true;
          }

          console.log('player', this.player);
          if (this.player && this.opponent) {
            if (this.player.readyToEnterGame && this.opponent.readyToEnterGame) {
              console.log('both players ready to enter game');
              // this.showLobby = false;
              // this.gameStarted = true;
            }

            if (this.player.score === this.winningScore || this.opponent.score === this.winningScore) {
              this.gameCompleted = true;
            }

            if (this.player.score === this.winningScore || this.opponent.score === this.winningScore) {
              this.gameCompleted = true;
            }
          }


        }

      };
    });

    this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
      if (opponent) {
        this.opponent = opponent
        console.log('opponent', this.opponent);
        if (this.player && this.opponent) {
          // if (this.player.readyToEnterGame && this.opponent.readyToEnterGame) {
          //   console.log('game on')
          //   this.showLobby = false;
          //   this.gameStarted = true;
          // }

          if (this.player.score === this.winningScore || this.opponent.score === this.winningScore) {
            this.gameCompleted = true;
          }
        }
      };
    });
  }

  private _subscribeToRequests(): void {
    this._requestsSubscription = this._dataService.getRequests().subscribe(requests => {
      console.log('requests', requests);
      if (requests) {
        if (this.player) {
          const playerId = this.player.playerId;
          const unrespondedRequest = requests.find(request => request.opponentId === playerId && request.accepted === false && request.responded === false);

          const respondedRequest = requests.find(request => request.opponentId === playerId && request.accepted === true && request.responded === true);

          if (unrespondedRequest) {
            this.showModal = true;
            this.modalMessage = `You have a challenge from ${unrespondedRequest.challengerName}`;
            this.challengerId = unrespondedRequest.challengerId;
            this.requestId = unrespondedRequest.id;;

          }

          if (respondedRequest) {
            const updatedPlayerData = {
              ...this.player,
              readyToEnterGame: true,
              session: respondedRequest.id
            } as IPlayer;


            const challenger = this.activePlayers?.find(player => player.playerId === this.challengerId);
            const challengerId = challenger?.id;
            if (challengerId) {
              this._dataService.getIndividualPlayer(challengerId).pipe(
                take(1)
              ).subscribe(opponent => {
                if (opponent) {

                  const opponentData = {
                    ...opponent,
                    isReady: false,
                    score: 0,
                    readyToEnterGame: true,
                    session: respondedRequest.id,
                  } as IPlayer;
                  const board = this._boardService.createBoard(opponentData);
                  opponentData.board = board;
                  console.log('opponent data', opponentData);
                }
              });
            }


            this._gameService.updatePlayer(updatedPlayerData);
          }
        }
      }
    });
  }
}
