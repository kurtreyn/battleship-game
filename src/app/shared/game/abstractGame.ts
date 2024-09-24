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
  lastUpdated: number = 0;
  displayRows: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  displayColumns: string[] = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  shipsToSet: string[] = [SHIP_NAME.CARRIER, SHIP_NAME.BATTLESHIP, SHIP_NAME.CRUISER, SHIP_NAME.SUBMARINE, SHIP_NAME.DESTROYER];
  isDragging: boolean = false;
  dragStartCell: ICell | null = null;
  dragEndCell: ICell | null = null;
  currentShipLength: number = 0;

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
    this.showModal = !this.showModal;
  }

  cancelGame(): void {
    console.log(this.requestId)
    // this._dataService.deleteRequest(this.requestId);
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
          // console.log('HOME -- THIS.PLAYER', this.player);

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

            if (thisGame) {
              console.log('thisGame.id', thisGame.id);
              this.requestId = thisGame?.id;
            }
            console.log('last updated', this.lastUpdated);

            this._dataService.getAllPlayers().pipe(
              take(1)
            ).subscribe(players => {
              // find the player who initiated the challenge/game and make them player one
              const playerOne = players.find(player => player.playerId === thisGame?.challengerId);

              // find the player who accepted the challenge/game and make them player two
              const playerTwo = players.find(player => player.playerId === thisGame?.opponentId);

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
            })
          }
        }
      }
    });
  }



  // ---- BOARD METHODS ----

  getRowCells(row: string): ICell[] {
    if (!this.player.board || !this.player.board.rows) {
      return [];
    }

    const cells = this.player.board.rows[row.toLowerCase()] || [];

    return cells;
  }

  getOpponentRowCells(row: string): ICell[] {
    if (!this.opponent.board || !this.opponent.board.rows) {
      return [];
    }

    const cells = this.opponent.board.rows[row.toLowerCase()] || [];

    return cells;
  }

  onMouseDown(cell: ICell) {
    // check if the board is in setup mode and the cell is not occupied in order to begin setting the ship
    if (this.player.boardSetup!.isSettingUp && !cell.occupied) {
      this.isDragging = true;
      this.dragStartCell = cell;
      this._highlightCells(cell, cell);
    }
  }

  onMouseEnter(cell: ICell) {
    // check if the board is in setup mode and the cell is not occupied in order to highlight the selected cells
    if (this.isDragging && !cell.occupied) {
      this._highlightCells(this.dragStartCell!, cell);
    }
  }

  onMouseUp(cell: ICell) {
    // check if the board is in setup mode and the cell is not occupied in order to place the ship
    if (this.isDragging) {
      this.isDragging = false;
      this.dragEndCell = cell;
      this._placeShip();
    }
  }

  onCellClick(cell: ICell) {
    const player = this._gameService.getPlayer();
    if (player) {
      // console.log('player in board component', player.name);
      // console.log('player.isTurn:', player.isTurn);
      if (cell && this.gameStarted && player.isTurn) {
        console.log(`player.name: ${player.name} is attacking ${this.opponent.name}`);
        const cellInfo = this._getCellInfo(cell);
        const { coordinates } = cellInfo;
        const { x, y } = cell;
        // console.log('Cell Clicked:', cellInfo);
        console.log('coordinates:', coordinates);
        if (this.opponent.shipArray?.includes(coordinates) && this.opponent.board !== undefined) {
          console.log('HIT')
          // this.opponent.isTurn
          cell.hit = true;
          // console.log(`x: ${x}, y: ${y}`);

          const updatedOpponentData = {
            ...this.opponent,
            isTurn: true,
            board: {
              ...this.opponent.board,
              cells: this.opponent.board.cells.map(cell => {
                if (cell.x === x && cell.y === y) {
                  return { ...cell, hit: true };
                }
                return cell;
              }),
              rows: this.opponent.board!.rows
            }
          };

          const updatedPlayerData = {
            ...player,
            isTurn: false,
            score: player.score! + 1,
            board: {
              ...player.board,
              cells: player.board!.cells.map(cell => {
                if (cell.x === x && cell.y === y) {
                  return { ...cell, hit: true };
                }
                return cell;
              }),
              rows: player.board!.rows
            }
          }
          // console.log('updated opponent data', updatedOpponentData);
          // console.log('updated player data', updatedPlayerData);
          // update opponent data
          this._dataService.updatePlayer(updatedOpponentData);
          // this._gameService.updateOpponent(updatedOpponentData);
          // update player data
          this._dataService.updatePlayer(updatedPlayerData);
          // this._gameService.updatePlayer(updatedPlayerData);

        } else {
          console.log('MISS')
          cell.miss = true;

          const updatedOpponentData = {
            ...this.opponent,
            isTurn: true,
            board: {
              ...this.opponent.board,
              cells: this.opponent.board!.cells.map(cell => {
                if (cell.x === x && cell.y === y) {
                  return { ...cell, miss: true };
                }
                return cell;
              }),
              rows: this.opponent.board!.rows
            }
          };

          const updatedPlayerData = {
            ...player,
            isTurn: false,
          }
          // console.log('updated opponent data', updatedOpponentData);
          // console.log('updated player data', updatedPlayerData);
          // update opponent data
          this._dataService.updatePlayer(updatedOpponentData);
          // this._gameService.updateOpponent(updatedOpponentData);
          // update player data
          this._dataService.updatePlayer(updatedPlayerData);
          // this._gameService.updatePlayer(updatedPlayerData);

        }
      }
    }
    const updatedTime = new Date().getTime();
    console.log('updatedTime in board component', updatedTime);
    this._dataService.sendUpdate(this.requestId, updatedTime);
  }

  toggleBoardSetup() {
    if (!this.player.boardSetup!.isFinishedSettingUp) {
      this.player.boardSetup!.isSettingUp = !this.player.boardSetup!.isSettingUp;
      this.player.boardSetup!.settingShip = this.shipsToSet[0];
      this.currentShipLength = this._boardService.getShipLength(this.player.boardSetup!.settingShip);
    } else {
      this._setPlayerAsReady();
    }

  }

  hasShipBeenSet(ship: string): boolean {
    // used to determine if a ship has been set in order to apply the appropriate css class on which ship is currently being set and which ships have been set
    switch (ship) {
      case SHIP_NAME.CARRIER:
        return this.player.boardSetup!.carrierSet;
      case SHIP_NAME.BATTLESHIP:
        return this.player.boardSetup!.battleshipSet;
      case SHIP_NAME.CRUISER:
        return this.player.boardSetup!.cruiserSet;
      case SHIP_NAME.SUBMARINE:
        return this.player.boardSetup!.submarineSet;
      case SHIP_NAME.DESTROYER:
        return this.player.boardSetup!.destroyerSet;
      default:
        return false;
    }
  }

  resetBoard() {
    this.player.board!.cells.forEach(cell => {
      cell.occupied = false;
      cell.hit = false;
      cell.miss = false;
      cell.highlighted = false;
    });
    this.player.boardSetup! = {
      isSettingUp: false,
      carrierSet: false,
      battleshipSet: false,
      cruiserSet: false,
      submarineSet: false,
      destroyerSet: false,
      settingShip: '',
      isFinishedSettingUp: false
    }
    this.player.shipLocations! = {
      carrier: [],
      battleship: [],
      cruiser: [],
      submarine: [],
      destroyer: []
    }
    this.player.boardSetup!.settingShip = this.shipsToSet[0];
    this.currentShipLength = this._boardService.getShipLength(this.player.boardSetup!.settingShip);
  }

  private _setPlayerAsReady() {
    this.player.isReady = true;
    this._gameService.updatePlayer(this.player);
    this._dataService.updatePlayer(this.player);
  }

  private _getCellInfo(cell: ICell) {
    const cellInfo: ICell = {
      x: cell.x,
      y: cell.y,
      row_label: cell.row_label,
      coordinates: cell.coordinates,
      occupied: cell.occupied,
      hit: cell.hit,
      miss: cell.miss,
      playerId: cell.playerId,
    }
    // console.log('Cell Info:', cellInfo);
    return cellInfo;
  }


  private _highlightCells(startCell: ICell, endCell: ICell) {
    this._resetHighlight();
    const cells = this._getCellsBetween(startCell, endCell);
    if (this._isValidPlacement(cells)) {
      cells.forEach(cell => {
        cell.highlighted = true
      });
    }
  }

  private _resetHighlight(): void {
    this.player.board!.cells.forEach(cell => cell.highlighted = false);
  }

  private _getCellsBetween(start: ICell, end: ICell): ICell[] {
    const cells: ICell[] = [];
    // determine if the ship is vertical or horizontal
    const isVertical = start.y === end.y;
    // calculate the length of the ship, the length is the absolute difference between the start and end cell plus 1
    const length = isVertical ? Math.abs(end.x - start.x) + 1 : Math.abs(end.y - start.y) + 1;
    // the max length of the ship is the minimum between the calculated length and the current ship length, that way we can't place a ship longer than the current ship
    const maxLength = Math.min(length, this.currentShipLength);

    for (let i = 0; i < maxLength; i++) {
      const { x, y } = this._calculateCoordinates(start, end, i, isVertical);
      const cell = this.player.board!.cells.find(c => c.x === x && c.y === y);
      if (cell) {
        // add the cell to the cells array if it exists
        cells.push(cell);
      }
    }
    return cells;
  }

  private _calculateCoordinates(start: ICell, end: ICell, i: number, isVertical: boolean): { x: number, y: number } {
    // calculate the coordinates of the cells between the start and end cells
    // if the ship is vertical, the y value will be the same for all cells, otherwise the x value will be the same
    const x = isVertical ? Math.min(start.x, end.x) + i : start.x;
    const y = isVertical ? start.y : Math.min(start.y, end.y) + i;
    return { x, y };
  }

  private _isValidPlacement(cells: ICell[]): boolean {
    return cells.length === this.currentShipLength && cells.every(cell => !cell.occupied);
  }

  private _placeShip(): void {
    const cells = this._getCellsBetween(this.dragStartCell!, this.dragEndCell!);
    if (this._isValidPlacement(cells)) {
      cells.forEach(cell => {
        cell.occupied = true;
        cell.highlighted = false;
      });
      this._updateShipLocation(cells);
      this._updateSettingShip();
    }
  }

  private _updateShipLocation(cells: ICell[]): void {
    const coordinates = cells.map(cell => cell.coordinates);
    switch (this.player.boardSetup!.settingShip) {
      case SHIP_NAME.CARRIER:
        this.player.shipLocations!.carrier = coordinates;
        this.player.boardSetup!.carrierSet = true;
        break;
      case SHIP_NAME.BATTLESHIP:
        this.player.shipLocations!.battleship = coordinates;
        this.player.boardSetup!.battleshipSet = true;
        break;
      case SHIP_NAME.CRUISER:
        this.player.shipLocations!.cruiser = coordinates;
        this.player.boardSetup!.cruiserSet = true;
        break;
      case SHIP_NAME.SUBMARINE:
        this.player.shipLocations!.submarine = coordinates;
        this.player.boardSetup!.submarineSet = true;
        break;
      case SHIP_NAME.DESTROYER:
        this.player.shipLocations!.destroyer = coordinates;
        this.player.boardSetup!.destroyerSet = true;
        break;
    }
  }

  private _updateSettingShip() {
    if (this.player.boardSetup!.isSettingUp) {
      if (!this.player.boardSetup!.carrierSet) {
        this.player.boardSetup!.settingShip = SHIP_NAME.CARRIER;
        this.currentShipLength = SHIP_LEN.CARRIER;
      } else if (!this.player.boardSetup!.battleshipSet) {
        this.player.boardSetup!.settingShip = SHIP_NAME.BATTLESHIP;
        this.currentShipLength = SHIP_LEN.BATTLESHIP;
      } else if (!this.player.boardSetup!.cruiserSet) {
        this.player.boardSetup!.settingShip = SHIP_NAME.CRUISER;
        this.currentShipLength = SHIP_LEN.CRUISER;
      } else if (!this.player.boardSetup!.submarineSet) {
        this.player.boardSetup!.settingShip = SHIP_NAME.SUBMARINE;
        this.currentShipLength = SHIP_LEN.SUBMARINE;
      } else if (!this.player.boardSetup!.destroyerSet) {
        this.player.boardSetup!.settingShip = SHIP_NAME.DESTROYER;
        this.currentShipLength = SHIP_LEN.DESTROYER;
      } else {
        this.player.boardSetup!.isSettingUp = false;
        this.player.boardSetup!.isFinishedSettingUp = true;
      }
    }

    if (this.player.boardSetup!.isFinishedSettingUp) {
      // console.log('this.player FINISHED SETUP', this.player)
      const shipArr = Object.values(this.player.shipLocations!).flat();

      const updatedPlayerData = {
        ...this.player,
        session: this.sessionId,
        finishedSetup: true,
        shipArray: shipArr
      }

      // console.log('updated player data', updatedPlayerData);
      this.player = updatedPlayerData;
      this._dataService.updatePlayer(updatedPlayerData);
      this._gameService.updatePlayer(updatedPlayerData);
    }
  }


}
