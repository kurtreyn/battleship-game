import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
import { IPlayer } from 'src/app/models/game';
import { Subscription, BehaviorSubject } from 'rxjs';
import { GAME } from 'src/app/enums/enums';
import { take, switchMap, filter } from 'rxjs/operators';

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
  player!: IPlayer;
  opponent!: IPlayer;
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
  private _playerSubject: BehaviorSubject<IPlayer | null> = new BehaviorSubject<IPlayer | null>(null);

  constructor(
    private _gameService: GameService,
    private _dataService: DataService,
    private _authService: AuthService,
    private _boardService: BoardService
  ) { }

  ngOnInit(): void {
    this._getCurrentUser();
    this._subscribeToPlayerUpdates();
    this._subscribeToRequests();
    this._subscribeToActivePlayers();
  }

  ngOnDestroy(): void {
    this._playerSubscription.unsubscribe();
    this._opponentSubscription.unsubscribe();
    this._activePlayersSubscription.unsubscribe();
    this._currentUserSubscription.unsubscribe();
    this._requestsSubscription.unsubscribe();
  }

  toggleShowLogin(): void {
    this.showLogin = !this.showLogin;
  }

  toggleShowModal(): void {
    console.log('show modal');
    this.showModal = !this.showModal;
  }

  cancelGame(): void {
    console.log(this.requestId)
    this._dataService.deleteRequest(this.requestId);
    const board = this._boardService.createBoard(this.player);
    const defaultPlayerData = {
      ...this.player,
      board: board,
      shipLocations: this._boardService.initializeShipLocations(),
      boardSetup: this._boardService.initializeBoardSetup(),
      shipArray: [],
      readyToEnterGame: false,
      session: '',
      finishedSetup: false,
      isReady: false,
    } as IPlayer;
    this._gameService.updatePlayer(defaultPlayerData);
    this._dataService.updatePlayer(defaultPlayerData);
    this.gameStarted = false;
    this.showLobby = true;
  }

  onLogout(): void {
    this._authService.logout();
    this.isLoggedIn = false;
    this.showLobby = false;
    this.showLogin = true;
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
        isTurn: false,
      } as IPlayer;
      this._gameService.updatePlayer(updatedPlayerData);
      this._dataService.updatePlayer(updatedPlayerData);

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
        isTurn: true,
      } as IPlayer;
      this._gameService.updatePlayer(updatedPlayerData);
      this._dataService.updatePlayer(updatedPlayerData);

      // console.log('updated player data', updatedPlayerData);
      const responded = true;
      const accepted = true;
      const gameStarted = true;
      this._dataService.respondToRequest(this.requestId, responded, accepted, gameStarted);
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
            this._playerSubject.next(player); // Emit the player value
          }
        });
      } else {
        console.log('no user');
      }
    });
  }

  private _subscribeToActivePlayers(): void {
    this._activePlayersSubscription = this._playerSubject.pipe(
      filter(player => player !== null), // Ensure player is not null
      switchMap(player => this._dataService.getAllPlayers())
    ).subscribe(players => {
      if (players) {
        const activePlayers = players.filter(player => player.isActive === true && player.playerId !== this.player?.playerId);
        this.activePlayers = activePlayers;
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
      }
    });

    this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
      // console.log('OPPONENT - HOME', opponent);
      if (opponent) {
        this.opponent = opponent;
        // console.log('THIS.OPPONENT - HOME', this.opponent);
      }
    });
  }

  private _subscribeToRequests(): void {
    this._requestsSubscription = this._playerSubject.pipe(
      filter(player => player !== null),
      switchMap(player => this._dataService.getRequests())
    ).subscribe(requests => {
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
          // console.log('unrespondedRequestFromOpponent', unrespondedRequestFromOpponent);
          // console.log('respondedRequestFromOpponent', respondedRequestFromOpponent);
          // console.log('unrespondedRequestFromChallenger', unrespondedRequestFromChallenger);




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
            this._dataService.getAllPlayers().pipe(
              take(1)
            ).subscribe(players => {
              const scopedPlayer = players.find(player => player.playerId === respondedRequestFromChallenger.challengerId);
              const scopedPlayerId = scopedPlayer?.playerId;
              this.requestId = respondedRequestFromChallenger.id;

              if (scopedPlayerId === this.player?.playerId) {
                this.beginSetupMode = true;
                this.showModal = true;
                this.modalMessage = `${respondedRequestFromChallenger.opponentName} accepted your challenge. Are you ready to setup your board?`;
              }
            });

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
                  this._gameService.updateOpponent(playerTwo);

                }
                if (playerTwo.id === playerId) {
                  // on the opponent's side, the opponent is player one
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