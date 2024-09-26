import { Injectable } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
import { IPlayer, ICell } from 'src/app/models/game';
import { Subscription, BehaviorSubject } from 'rxjs';
import { GAME } from 'src/app/enums/enums';
import { take, switchMap, filter } from 'rxjs/operators';
import { SHIP_NAME, SHIP_LEN } from 'src/app/enums/enums';

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
  acknowledgeGameOver: boolean = false;

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
    console.log('requestId', this.requestId);
    if (this.requestId) {
      this._dataService.deleteRequest(this.requestId);
    }
    const player = this._gameService.getPlayer();
    const board = this._boardService.createBoard(this.player);
    const defaultPlayerData = {
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

    console.log('default player data', defaultPlayerData);
    this._gameService.updatePlayer(defaultPlayerData);
    this._dataService.updatePlayer(defaultPlayerData);
    this.gameStarted = false;
    this.gameCompleted = false;
    this.sessionId = '';
    this.requestId = '';
    this.modalMessage = '';
    this.lastUpdated = 0;
    this.beginSetupMode = false;
    this.showLobby = true;
    this.showModal = false;
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

  onGameCompletedEvent(): void {
    this.cancelGame();
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


  private _handlePlayerUpdate(player: IPlayer, opponent: IPlayer, playerId: string, currentTime: number) {
    const playerScore = player.score;
    const opponentScore = opponent.score;

    this._gameService.updateOpponent(opponent);

    if (currentTime > this.lastUpdated) {
      console.log(`Player (${player.name}) score: ${playerScore}, Opponent (${opponent.name}) score: ${opponentScore}, isWinner: ${player.isWinner}`);

      if (playerScore === GAME.WINNING_SCORE) {
        this._updateWinner(player);
      } else if (opponentScore === GAME.WINNING_SCORE) {
        this._updateWinner(opponent);
      } else {
        this._gameService.updatePlayer(player);
        this._gameService.updateOpponent(opponent);
      }
    }
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
    }
  }


  private _checkAndUpdatePlayers(playerOne: IPlayer, playerTwo: IPlayer, playerId: string, currentTime: number) {
    if (playerOne.id === playerId) {
      this._handlePlayerUpdate(playerOne, playerTwo, playerId, currentTime);
    } else if (playerTwo.id === playerId) {
      this._handlePlayerUpdate(playerTwo, playerOne, playerId, currentTime);
    }
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
          // console.log('HOME -- THIS.PLAYER', this.player);

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
          // console.log('HOME -- THIS.PLAYER', this.player.name);

          if (this.player) {
            if (this.player.readyToEnterGame) {
              this.showLobby = false;
              this.gameStarted = true;
            }

            if (this.player.session) {
              this.sessionId = this.player.session;
              // console.log('SESSION ID', this.sessionId);
            }
          }
        }
      }
    });

    this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
      // console.log('OPPONENT - HOME', opponent);
      if (opponent) {
        this.opponent = opponent;
        // console.log('THIS.OPPONENT - HOME', this.opponent.name);
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
              console.log('this.requestId', this.requestId);

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
            this.lastUpdated = thisGame?.lastUpdated;
            const currentTime = new Date().getTime();

            if (thisGame) {
              // console.log('thisGame.id', thisGame.id);
              this.requestId = thisGame?.id;
            }
            // console.log('last updated', this.lastUpdated);

            this._dataService.getAllPlayers().pipe(
              take(1)
            ).subscribe(players => {
              // find the player who initiated the challenge/game and make them player one
              const playerOne = players.find(player => player.playerId === thisGame?.challengerId);

              // find the player who accepted the challenge/game and make them player two
              const playerTwo = players.find(player => player.playerId === thisGame?.opponentId);

              if (playerOne && playerTwo && playerOne.id && playerTwo.id && playerId) {
                this._checkAndUpdatePlayers(playerOne, playerTwo, playerId, currentTime);
                // if (playerOne.id && playerTwo.id) {
                //   const playerOneScore = playerOne.score;
                //   const playerTwoScore = playerTwo.score;
                //   if (playerOne.id === playerId) {
                //     // on the challenger's side, the opponent is player two
                //     this._gameService.updateOpponent(playerTwo);

                //     // used to trigger updates to the opponent's side
                //     if (currentTime > this.lastUpdated) {

                //       console.log(`FIRST: player one (${playerOne.name}) score: ${playerOneScore} player two (${playerTwo.name}) score: ${playerTwoScore}, isWinner: ${playerOne.isWinner}`);

                //       if (playerOneScore === GAME.WINNING_SCORE) {
                //         const updatedPlayerOneData = {
                //           ...playerOne,
                //           isWinner: true
                //         } as IPlayer;
                //         this._dataService.updatePlayer(updatedPlayerOneData);
                //         this._gameService.updatePlayer(updatedPlayerOneData);
                //         this.gameCompleted = true;

                //         if (this.gameCompleted) {
                //           this.showModal = true;
                //           const winningPlayerName = playerOne.isWinner ? playerOne.name : playerTwo.name;
                //           this.modalMessage = `${winningPlayerName} has won the game.`;
                //         }

                //         // console.log('game completed: ', this.gameCompleted);
                //       } else if (playerTwoScore === GAME.WINNING_SCORE) {
                //         const updatedPlayerTwoData = {
                //           ...playerTwo,
                //           isWinner: true
                //         } as IPlayer;
                //         this._dataService.updatePlayer(updatedPlayerTwoData);
                //         this._gameService.updatePlayer(updatedPlayerTwoData);
                //         this.gameCompleted = true;

                //         if (this.gameCompleted) {
                //           this.showModal = true;
                //           const winningPlayerName = playerOne.isWinner ? playerOne.name : playerTwo.name;
                //           this.modalMessage = `${winningPlayerName} has won the game.`;
                //         }
                //         // console.log('game completed: ', this.gameCompleted);
                //       } else {
                //         this._gameService.updatePlayer(playerOne)
                //         this._gameService.updateOpponent(playerTwo)
                //       }


                //     }
                //   }


                //   if (playerTwo.id === playerId) {
                //     // on the opponent's side, the opponent is player one
                //     this._gameService.updateOpponent(playerOne);

                //     // used to trigger updates to the opponent's side
                //     if (currentTime > this.lastUpdated) {

                //       console.log(`SECOND: player one (${playerOne.name}) score: ${playerOneScore} player two (${playerTwo.name}) score: ${playerTwoScore}, isWinner: ${playerTwo.isWinner}`);

                //       if (playerTwoScore === GAME.WINNING_SCORE) {
                //         const updatedPlayerTwoData = {
                //           ...playerTwo,
                //           isWinner: true
                //         } as IPlayer;
                //         this._dataService.updatePlayer(updatedPlayerTwoData);
                //         this._gameService.updatePlayer(updatedPlayerTwoData);
                //         this.gameCompleted = true;

                //         if (this.gameCompleted) {
                //           this.showModal = true;
                //           const winningPlayerName = playerOne.isWinner ? playerOne.name : playerTwo.name;
                //           this.modalMessage = `${winningPlayerName} has won the game.`;
                //         }
                //         console.log('game completed: ', this.gameCompleted);
                //       } else if (playerOneScore === GAME.WINNING_SCORE) {
                //         const updatedPlayerOneData = {
                //           ...playerOne,
                //           isWinner: true
                //         } as IPlayer;
                //         this._dataService.updatePlayer(updatedPlayerOneData);
                //         this._gameService.updatePlayer(updatedPlayerOneData);
                //         this.gameCompleted = true;

                //         if (this.gameCompleted) {
                //           this.showModal = true;
                //           const winningPlayerName = playerOne.isWinner ? playerOne.name : playerTwo.name;
                //           this.modalMessage = `${winningPlayerName} has won the game.`;
                //         }
                //         console.log('game completed: ', this.gameCompleted);
                //       } else {
                //         this._gameService.updatePlayer(playerTwo)
                //         this._gameService.updateOpponent(playerOne)
                //       }


                //     }
                //   }
                // }
              }
            })
          }
        }
      }
    });
  }
}
