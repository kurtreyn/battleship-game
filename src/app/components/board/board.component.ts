import { Component, Input } from '@angular/core';
import { AbstractGame } from '../../shared/game/abstractGame';
import { BoardService } from '../../services/board.service';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { ICell } from '../../models/game';
import { SHIP_LEN, SHIP_NAME } from '../../enums/enums';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent extends AbstractGame {
  @Input() isOpponent: boolean = false;
  hideToggleButton: boolean = false;

  private _touchStartCell: ICell | null = null;

  constructor(
    public gameService: GameService,
    public dataService: DataService,
    public authService: AuthService,
    public boardService: BoardService
  ) {
    super(
      gameService,
      dataService,
      authService,
      boardService
    )
  }

  // map out cells on the player's board
  getRowCells(row: string): ICell[] {
    if (!this.player.board || !this.player.board.rows) {
      return [];
    }
    const cells = this.player.board.rows[row.toLowerCase()] || [];
    return cells;
  }

  // map out cells on the opponent's board
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



  onTouchStart(event: TouchEvent, cell: ICell) {
    event.preventDefault();
    this._touchStartCell = cell;
    this.isDragging = true;
    this.dragStartCell = cell;
    this._highlightCells(cell, cell);
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (!this._touchStartCell || !this.isDragging) return;
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    const cellElement = element.closest('.grid-cell') as HTMLElement;

    if (cellElement) {
      const cell = this._returnMobileCell(cellElement);
      if (cell) {
        this._highlightCells(this._touchStartCell, cell);
      }
    } else {
      console.error('No cell element found under touch point');
    }
  }

  onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    if (!this._touchStartCell || !this.isDragging) return;
    const touch = event.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    const cellElement = element.closest('.grid-cell') as HTMLElement;
    if (cellElement) {
      const cell = this._returnMobileCell(cellElement);
      if (cell) {
        this.isDragging = false;
        this.dragEndCell = cell;
        this._placeShip();
      }
    }
    this._touchStartCell = null;
    this.isDragging = false;
  }



  onCellClick(cell: ICell) {
    if (this.player.boardSetup!.isSettingUp) {
      return;
    } else {
      const player = this.gameService.getPlayer();
      if (player) {
        if (cell && this.gameStarted && player.isTurn) {
          const cellInfo = this._getCellInfo(cell);
          const { coordinates } = cellInfo;
          const { x, y } = cell;

          if (this.opponent.shipArray?.includes(coordinates) && this.opponent.board !== undefined) {
            cell.hit = true;

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
              },
              lastUpdated: new Date().getTime()
            };

            const updatedPlayerData = {
              ...player,
              isTurn: false,
              score: player.score! + 1,
              isWinner: player.score === this.winningScore ? true : false,
              board: {
                ...player.board,
                cells: player.board!.cells.map(cell => {
                  if (cell.x === x && cell.y === y) {
                    return { ...cell, hit: true };
                  }
                  return cell;
                }),
                rows: player.board!.rows
              },
              lastUpdated: new Date().getTime()
            }

            // update player data
            this.dataService.updatePlayer(updatedPlayerData)
            // update opponent data
            this.dataService.updatePlayer(updatedOpponentData);
            this.gameService.updatePlayerAndOpponent(updatedPlayerData, updatedOpponentData);

          } else {
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
              },
              lastUpdated: new Date().getTime()
            };

            const updatedPlayerData = {
              ...player,
              isTurn: false,
              lastUpdated: new Date().getTime()
            }

            // update player data
            this.dataService.updatePlayer(updatedPlayerData)
            // update opponent data
            this.dataService.updatePlayer(updatedOpponentData);
            this.gameService.updatePlayerAndOpponent(updatedPlayerData, updatedOpponentData);
          }
        }
      }

      this._triggerUpdate();
    }
  }

  toggleBoardSetup() {
    if (!this.player.boardSetup!.isFinishedSettingUp) {
      this.player.boardSetup!.isSettingUp = !this.player.boardSetup!.isSettingUp;
      this.player.boardSetup!.settingShip = this.shipsToSet[0];
      this.currentShipLength = this.boardService.getShipLength(this.player.boardSetup!.settingShip);
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
    this.player.boardSetup!.isSettingUp = false;
    this.player.boardSetup!.settingShip = this.shipsToSet[0];
    this.currentShipLength = this.boardService.getShipLength(this.player.boardSetup!.settingShip);
  }



  private _setPlayerAsReady() {
    if (this.player.boardSetup!.isFinishedSettingUp) {
      const shipArr = Object.values(this.player.shipLocations!).flat();

      const updatedPlayerData = {
        ...this.player,
        session: this.sessionId,
        finishedSetup: true,
        isReady: true,
        shipArray: shipArr
      }
      this.dataService.updatePlayer(updatedPlayerData);
      this.gameService.updatePlayer(updatedPlayerData);
      this._triggerUpdate();
    }
  }

  private _triggerUpdate() {
    const updatedTime = new Date().getTime();
    const responded = true;
    const accepted = true;
    const gameStarted = true;
    const gameEnded = false;
    // used to trigger update on opponent's screen
    this.dataService.sendUpdate(this.requestId, responded, accepted, gameStarted, updatedTime, gameEnded);
  }

  private _returnMobileCell(cellElement: HTMLElement) {
    const x = parseInt(cellElement.getAttribute('data-x') || '0', 10);
    const y = parseInt(cellElement.getAttribute('data-y') || '0', 10);
    const cell = this.player.board!.cells.find(c => c.x === x && c.y === y);
    return cell;
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
    return cellInfo;
  }


  private _highlightCells(startCell: ICell, endCell: ICell) {
    this._resetHighlight();
    const cells = this._getCellsBetween(startCell, endCell);
    if (this._isValidPlacement(cells)) {
      cells.forEach(cell => {
        cell.highlighted = true;
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
    if (cells.length !== this.currentShipLength) {
      return false;
    }
    const occupiedCell = cells.find(cell => cell.occupied);
    if (occupiedCell) {
      return false;
    }
    return true;
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
  }


}