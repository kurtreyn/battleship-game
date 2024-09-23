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
  player!: IPlayer
  opponent!: IPlayer
  gameStarted: boolean = false;
  gameCompleted: boolean = false;
  winningScore: number = GAME.WINNING_SCORE;
  showModal: boolean = false;
  modalMessage: string = '';
  beginSetupMode: boolean = false;
  challengerId: string = '';
  requestId: string = '';
  sessionId: string = '';

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

  onChallengeResponse(response: boolean): void {
    this.showModal = false;
    const responded = true;
    const gameStarted = false;
    if (response) {
      this._dataService.respondToRequest(this.requestId, responded, response, gameStarted);

      const updatedPlayerData = {
        ...this.player,
        readyToEnterGame: true,
        session: this.requestId,
        finishedSetup: false,
        isReady: false,
      } as IPlayer;
      this._dataService.updatePlayer(updatedPlayerData);
      this._gameService.updatePlayer(updatedPlayerData);
    } else {
      this._dataService.respondToRequest(this.requestId, responded, response);
    }
  }

  onStartBoardSetup(response: boolean): void {
    this.showModal = false;
    if (response) {
      const updatedPlayerData = {
        ...this.player,
        readyToEnterGame: true,
        session: this.requestId,
        finishedSetup: false,
        isReady: false,
      } as IPlayer;
      this._dataService.updatePlayer(updatedPlayerData);
      this._gameService.updatePlayer(updatedPlayerData);
      // console.log('updated player data', updatedPlayerData);
      const respoded = true;
      const accepted = true;
      const gameStarted = true;
      this._dataService.respondToRequest(this.requestId, respoded, accepted, gameStarted);
    }
  }

  onResponseEvent(response: boolean): void {
    if (this.beginSetupMode) {
      this.onStartBoardSetup(response);
    } else {
      this.onChallengeResponse(response);
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
        // console.log('active players', this.activePlayers);
      }
    });
  }

  private _subscribeToPlayerUpdates(): void {
    this._playerSubscription = this._gameService.player$.subscribe(player => {
      // console.log('player', player);
      if (player) {
        if (player.isReady) {
          this.player = player;
          this.showLobby = false;
          this.gameStarted = true;

          if (this.player.session) {
            this.sessionId = this.player.session;
          }

        } else {
          const board = this._boardService.createBoard(player);
          const initPlayerData = {
            ...player,
            board: board,
            shipLocations: this._boardService.initializeShipLocations(),
            boardSetup: this._boardService.initializeBoardSetup(),
            shipArray: [],
          } as IPlayer;

          // console.log('INIT PLAYER DATA', initPlayerData);
          this.player = initPlayerData;
          console.log('HOME -- THIS.PLAYER', this.player);

          if (this.player) {
            if (this.player.readyToEnterGame) {
              this.showLobby = false;
              this.gameStarted = true;
            }

            if (this.player.session) {
              this.sessionId = this.player.session;
              console.log('SESSION ID', this.sessionId);
            }
          }
        }

      };
    });

    this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
      if (opponent) {
        this.opponent = opponent
        console.log('OPPONENT - HOME', this.opponent);
      };
    });
  }

  private _subscribeToRequests(): void {
    this._requestsSubscription = this._dataService.getRequests().subscribe(requests => {
      // console.log('requests', requests);
      if (requests) {

        if (this.player) {
          const playerId = this.player.playerId;

          // unresponded requests from the opponent's POV
          const unrespondedRequestFromOpponent = requests.find(request => request.opponentId === playerId && request.accepted === false && request.responded === false && request.gameStarted === false);

          // responded requests from the opponent's POV
          const respondedRequestFromOpponent = requests.find(request => request.opponentId === playerId && request.accepted === true && request.responded === true && request.gameStarted === false);

          // unresponded requests from the challenger's POV
          const unrespondedRequestFromChallenger = requests.find(request => request.challengerId === playerId && request.accepted === false && request.responded === false && request.gameStarted === false);

          // responded requests from the challenger's POV
          const respondedRequestFromChallenger = requests.find(request => request.challengerId === playerId && request.accepted === true && request.responded === true && request.gameStarted === false);

          const gamesInProgress = requests.filter(request => request.gameStarted === true);



          if (unrespondedRequestFromOpponent) {
            this.showModal = true;
            this.modalMessage = `You have a challenge from ${unrespondedRequestFromOpponent.challengerName}`;
            this.challengerId = unrespondedRequestFromOpponent.challengerId;
            this.requestId = unrespondedRequestFromOpponent.id;

          }

          if (respondedRequestFromOpponent) {
            // the challenger is the person who initiated the request and will be the opponent
            const updatedPlayerData = {
              ...this.player,
              readyToEnterGame: true,
              session: respondedRequestFromOpponent.id
            } as IPlayer;

            this._gameService.updatePlayer(updatedPlayerData);
          }

          if (respondedRequestFromChallenger) {
            // here we are getting the player who initiated the request
            const scopedPlayer = this.activePlayers?.find(player => player.playerId === respondedRequestFromChallenger.challengerId);
            const scopedPlayerId = scopedPlayer?.playerId;
            this.requestId = respondedRequestFromChallenger.id;

            if (scopedPlayerId === this.player?.playerId) {
              this.beginSetupMode = true;
              this.showModal = true;
              this.modalMessage = 'Ready to setup your board?';
            }
          }

          if (gamesInProgress) {
            // find a game in progress that matches the current session id
            const thisGame = gamesInProgress.find(game => game.id === this.sessionId);
            const playerId = this.player?.id;

            // find the player who initiated the challenge/game and make them player one
            const playerOne = this.activePlayers?.find(player => player.playerId === thisGame?.challengerId);

            // find the player who accepted the challenge/game and make them player two
            const playerTwo = this.activePlayers?.find(player => player.playerId === thisGame?.opponentId);

            if (playerOne && playerTwo) {
              if (playerOne.id && playerTwo.id) {
                if (playerOne.id === playerId) {
                  // on the challenger's side, the opponent is player two
                  this.opponent = playerTwo;
                  this._gameService.updateOpponent(playerTwo);

                }
                if (playerTwo.id === playerId) {
                  // on the opponent's side, the opponent is player one
                  this.opponent = playerOne;
                  this._gameService.updateOpponent(playerOne);
                }
              }
            }
          }
        }
      }
    });
  }
}
