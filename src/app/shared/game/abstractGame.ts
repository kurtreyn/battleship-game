import { Injectable } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
import { IPlayer, ICell } from 'src/app/models/game';
import { Subscription, BehaviorSubject } from 'rxjs';
import { GAME } from 'src/app/enums/enums';
import { take, switchMap, filter, distinctUntilChanged } from 'rxjs/operators';
import { SHIP_NAME } from 'src/app/enums/enums';

@Injectable({
  providedIn: 'root'
})
export abstract class AbstractGame implements OnInit, OnDestroy {
  activePlayers?: IPlayer[];
  isLoggedIn: boolean = false;
  player!: IPlayer;
  opponent!: IPlayer;
  gameStarted: boolean = false;
  gameCompleted: boolean = false;
  gameEnded: boolean = false;
  alreadyInGame: boolean = false;
  winningScore: number = GAME.WINNING_SCORE;
  beginSetupMode: boolean = false;
  challengerId: string = '';
  requestId: string = '';
  sessionId: string = '';
  lastUpdated: number = 0;
  displayRows: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  displayColumns: string[] = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  shipsToSet: string[] = [SHIP_NAME.CARRIER, SHIP_NAME.BATTLESHIP, SHIP_NAME.CRUISER, SHIP_NAME.SUBMARINE, SHIP_NAME.DESTROYER];
  isDragging: boolean = false;
  dragStartCell: ICell | null = null;
  dragEndCell: ICell | null = null;
  currentShipLength: number = 0;
  showLogin: boolean = false;
  showLobby: boolean = false;
  showModal: boolean = false;
  modalMessage: string = '';
  requiresUserAction: boolean = false;
  loading: boolean = false;
  playerOne: IPlayer | null = null;
  playerTwo: IPlayer | null = null;

  private _lastPlayerUpdate: IPlayer | null = null;
  private _lastOpponentUpdate: IPlayer | null = null;

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



  cancelGame(): void {
    const updatedTime = new Date().getTime();
    const responded = true;
    const accepted = true;
    const gameStarted = true;
    const gameEnded = true;
    this._dataService.sendUpdate(this.requestId, responded, accepted, gameStarted, updatedTime, gameEnded);
    this._resetGame(this.player);
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
      this._dataService.respondToRequest(this.requestId, responded, response, gameStarted);
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

  // future means of letting the player reset the game instead of it being automatic
  onGameCompletedEvent(): void {
    // TODO: Implement game reset
  }

  private _resetGame(player: IPlayer): void {
    if (this.requestId) {
      this._dataService.deleteRequest(this.requestId);
    }
    const board = this._boardService.createBoard(player);
    const updatedPlayerData = {
      ...player,
      board: board,
      shipLocations: this._boardService.initializeShipLocations(),
      boardSetup: this._boardService.initializeBoardSetup(),
      shipArray: [],
      readyToEnterGame: false,
      session: '',
      score: 0,
      finishedSetup: false,
      isReady: false,
      isWinner: false,
      isTurn: false,
    } as IPlayer;

    try {
      if (player) {
        this._dataService.updatePlayer(updatedPlayerData);
      }
    } catch (error) {
      console.error('Error updating player during resetGame:', error);
    }
    this._gameService.updatePlayer(updatedPlayerData);
    this._resetProperties();
  }

  private _resetProperties(): void {
    this.gameStarted = false;
    this.gameCompleted = false;
    this.sessionId = '';
    this.requestId = '';
    this.modalMessage = '';
    this.lastUpdated = 0;
    this.beginSetupMode = false;
    this.showLobby = true;
    this.showModal = false;
    this.requiresUserAction = false;
  }

  private _getCurrentUser(): void {
    this.loading = true;
    this._currentUserSubscription = this._authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.showLobby = true;
        this._dataService.getAllPlayers().pipe(
          take(1)
        ).subscribe(players => {
          this.loading = false;
          const player = players.find(player => player.playerId === user.uid);
          if (player) {
            this._gameService.setPlayer(player);
            this._playerSubject.next(player);
          }
        }, error => {
          this.loading = false;
          console.error('Error getting players:', error);
        }
        );
      } else {
        this.loading = false;
        console.log('no user');
      }
    }, error => {
      this.loading = false;
      console.error('Error getting current user:', error);
    });
  }

  private _isPlayerInGame(player: IPlayer): boolean {
    if (player.session) {
      if (player.session !== '') {
        return true;
      }
    }
    return false;
  }


  private _handlePlayerUpdate(player: IPlayer, opponent: IPlayer, currentTime: number) {
    const playerScore = player.score;
    const opponentScore = opponent.score;

    if (this._hasPlayerChanged(opponent)) {
      this.loading = true;
      this._gameService.updateOpponent(opponent);
      this.loading = false;
      this._lastOpponentUpdate = opponent;
    }

    if (currentTime > this.lastUpdated) {
      console.log('_handlePlayerUpdate, currentTime is greater than lastUpdated');
      if (playerScore === GAME.WINNING_SCORE) {
        this._updateWinner(player);
      } else if (opponentScore === GAME.WINNING_SCORE) {
        this._updateWinner(opponent);
      } else if (this._hasPlayerChanged(player)) {
        this.loading = true;
        this._gameService.updatePlayer(player);
        this.loading = false;
        this._lastPlayerUpdate = player;
      }
    }
  }

  private _hasPlayerChanged(player: IPlayer): boolean {
    const lastUpdate = player.id === this.player?.id ? this._lastPlayerUpdate : this._lastOpponentUpdate;
    const playerData = JSON.stringify(player);
    const lastUpdateData = JSON.stringify(lastUpdate);
    if (lastUpdate) {
      console.log('_hasPlayerChanged, lastUpdate:', lastUpdate.isTurn);
      console.log(`_hasPlayerChanged, playerData:`);
      console.log(`_hasPlayerChanged, lastUpdateData:`);
    }

    return !lastUpdate || playerData !== lastUpdateData;
  }


  private _updateWinner(winner: IPlayer) {
    const updatedWinnerData = {
      ...winner,
      isWinner: true
    } as IPlayer;

    this._dataService.updatePlayer(updatedWinnerData);
    this._gameService.updatePlayer(updatedWinnerData);
    this.gameCompleted = true;

    if (this.gameCompleted) {
      this.showModal = true;
      this.modalMessage = `${winner.name} has won the game.`;
      this.requiresUserAction = false;

      setTimeout(() => {
        if (this.playerOne) {
          this._resetGame(this.playerOne!);
        }
        if (this.playerTwo) {
          this._resetGame(this.playerTwo!);
        }
      }, 4000);
    }
  }


  private _checkAndUpdatePlayers(playerOne: IPlayer, playerTwo: IPlayer, playerId: string, currentTime: number, calledFrom: string): void {
    if (calledFrom) {
      console.log(calledFrom);
    }
    if (playerOne.id === playerId) {
      this._handlePlayerUpdate(playerOne, playerTwo, currentTime);
    } else if (playerTwo.id === playerId) {
      this._handlePlayerUpdate(playerTwo, playerOne, currentTime);
    }
  }


  private _subscribeToActivePlayers(): void {
    this._activePlayersSubscription = this._playerSubject.pipe(
      filter(player => player !== null),
      switchMap(player => this._dataService.getAllPlayers())
    ).subscribe(players => {
      if (players) {
        const activePlayers = players.filter(player => player.isActive === true && player.playerId !== this.player?.playerId);
        this.activePlayers = activePlayers;
      }
    });
  }

  private _managePlayerUpdate(player: IPlayer): void {
    console.log('managePlayerUpdate called')
    if (player.isReady) {
      this._initializePlayer(player);
    } else {
      this._initializeNewPlayer(player);
    }
  }

  private _manageOpponentUpdate(opponent: IPlayer): void {
    console.log('manageOpponentUpdate called')
    this.opponent = opponent;
  }

  private _initializePlayer(player: IPlayer): void {
    this.player = player;
    this.showLobby = false;
    this.gameStarted = true;

    if (this.player.session) {
      this.sessionId = this.player.session;
    }
  }

  private _initializeNewPlayer(player: IPlayer): void {
    const board = this._boardService.createBoard(player);
    const initPlayerData = {
      ...player,
      board: board,
      shipLocations: this._boardService.initializeShipLocations(),
      boardSetup: this._boardService.initializeBoardSetup(),
      shipArray: [],
      isReady: false,
    } as IPlayer;

    this.player = initPlayerData;

    if (this.player.readyToEnterGame) {
      this.showLobby = false;
      this.gameStarted = true;
    }

    if (this.player.session) {
      this.sessionId = this.player.session;
    }
  }

  private _subscribeToPlayerUpdates(): void {
    this._playerSubscription = this._gameService.player$.pipe(
      // used to reduce the number of updates to the player
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(player => {
      if (player) {
        this._managePlayerUpdate(player);
      }
    });

    this._opponentSubscription = this._gameService.opponent$.pipe(
      // used to reduce the number of updates to the opponent
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(opponent => {
      if (opponent) {
        this._manageOpponentUpdate(opponent);
      }
    });
  }

  private _subscribeToRequests(): void {
    this._requestsSubscription = this._playerSubject.pipe(
      filter(player => player !== null),
      switchMap(player => {
        this.loading = true;
        return this._dataService.getRequests();
      })
    ).subscribe(requests => {
      this.loading = false;
      if (requests) {

        if (this.player) {
          const playerId = this.player.playerId;

          // unresponded requests from the opponent's POV
          const unrespondedRequestFromOpponent = requests.find(request => request.opponentId === playerId && request.accepted === false && request.responded === false && request.gameStarted === false);

          // responded requests from the opponent's POV
          const respondedRequestFromOpponent = requests.find(request => request.opponentId === playerId && request.accepted === true && request.responded === true && request.gameStarted === false);

          // unresponded requests from the challenger's POV
          const unrespondedRequestFromChallenger = requests.find(request => request.challengerId === playerId && request.accepted === false && request.responded === false && request.gameStarted === false);

          if (unrespondedRequestFromChallenger) {
            this._dataService.getPlayerById(unrespondedRequestFromChallenger.opponentId).pipe(
              take(1)
            ).subscribe(opponent => {
              if (opponent) {
                if (this._isPlayerInGame(opponent)) {
                  this.showModal = true;
                  this.modalMessage = `${opponent.name} is already in a game. Your challenge request has been cancelled.`;
                  // Cancel the challenge request
                  const requestId = unrespondedRequestFromChallenger.id;
                  this._dataService.deleteRequest(requestId);
                }
              }
            },
              error => {
                console.error('Error getting opponent:', error);
              });
          }

          // responded requests from the challenger's POV which were declined
          const declinedRequestFromChallenger = requests.find(request => request.challengerId === playerId && request.accepted === false && request.responded === true && request.gameStarted === false);

          if (declinedRequestFromChallenger) {
            this.showModal = true;
            this.modalMessage = `${declinedRequestFromChallenger.opponentName} has declined your challenge request.`;
            this.requiresUserAction = false;
            this.requestId = declinedRequestFromChallenger.id;
            this._dataService.deleteRequest(this.requestId);
            setTimeout(() => {
              this._resetGame(this.player);
            }, 2000);
          }

          // responded requests from the challenger's POV
          const respondedRequestFromChallenger = requests.find(request => request.challengerId === playerId && request.accepted === true && request.responded === true && request.gameStarted === false);

          const gamesInProgress = requests.filter(request => request.gameStarted === true);

          // if the person being challenged is in a game, prevent a new challenge request
          if (unrespondedRequestFromOpponent) {
            if (this.sessionId === "" || this.sessionId === undefined) {
              this.showModal = true;
              this.modalMessage = `You have a challenge from ${unrespondedRequestFromOpponent.challengerName}`;
              this.challengerId = unrespondedRequestFromOpponent.challengerId;
              this.requestId = unrespondedRequestFromOpponent.id;
              this.requiresUserAction = true;
            }
          }

          if (respondedRequestFromOpponent) {
            // the challenger is the person who initiated the request
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
              this.loading = false;
              const scopedPlayer = players.find(player => player.playerId === respondedRequestFromChallenger.challengerId);
              const scopedPlayerId = scopedPlayer?.playerId;
              this.requestId = respondedRequestFromChallenger.id;

              if (scopedPlayerId === this.player?.playerId) {
                this.beginSetupMode = true;
                this.showModal = true;
                this.requiresUserAction = true;
                this.modalMessage = `${respondedRequestFromChallenger.opponentName} accepted your challenge. Are you ready to setup your board?`;

              }
            }, error => {
              this.loading = false;
              console.error('Error getting players:', error);
            });

          }

          if (gamesInProgress) {
            // find a game in progress that matches the current session id
            const thisGame = gamesInProgress.find(game => game.id === this.sessionId);
            const playerId = this.player?.id;
            this.lastUpdated = thisGame?.lastUpdated;
            const currentTime = new Date().getTime();

            if (thisGame) {
              this.requestId = thisGame?.id;
            }

            if (thisGame && thisGame.gameEnded) {
              this.gameEnded = true;
              this.showModal = true;
              this.modalMessage = 'The game has been cancelled by the other player.';
              this.requiresUserAction = false;
              setTimeout(() => {
                this._resetGame(this.player);
              }, 2000);
            } else {
              this.loading = true;
              this._dataService.getAllPlayers().pipe(
                take(1)
              ).subscribe(players => {
                this.loading = false;
                // find the player who initiated the challenge/game and make them player one
                const playerOne = players.find(player => player.playerId === thisGame?.challengerId);

                // find the player who accepted the challenge/game and make them player two
                const playerTwo = players.find(player => player.playerId === thisGame?.opponentId);

                if (playerOne && playerTwo && playerOne.id && playerTwo.id && playerId) {
                  this.playerOne = playerOne;
                  this.playerTwo = playerTwo;

                  this._checkAndUpdatePlayers(playerOne, playerTwo, playerId, currentTime, 'checkAndUpdatePlayers called');
                }
              }, error => {
                this.loading = false;
                console.error('Error getting players:', error);
              })
            }


          }
        }
      }
    });
  }
}