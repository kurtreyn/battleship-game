import { Component, Input, OnInit } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { GameService } from 'src/app/services/game.service';
import { ICell, IPlayer } from '../../models/game';
import { SHIP_LEN, SHIP_NAME } from '../../enums/enums';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  @Input() player!: IPlayer;
  @Input() isOpponent: boolean = false;
  @Input() gameStarted: boolean = false;
  displayRows: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  displayColumns: string[] = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  shipsToSet: string[] = [SHIP_NAME.CARRIER, SHIP_NAME.BATTLESHIP, SHIP_NAME.CRUISER, SHIP_NAME.SUBMARINE, SHIP_NAME.DESTROYER];
  isDragging: boolean = false;
  dragStartCell: ICell | null = null;
  dragEndCell: ICell | null = null;
  currentShipLength: number = 0;

  constructor(private _boardService: BoardService, private _gameService: GameService) { }



  ngOnInit(): void {
    this.player.boardSetup!.settingShip = this.shipsToSet[0];
    this.currentShipLength = this._boardService.getShipLength(this.player.boardSetup!.settingShip);
    // console.log('Player', this.player.name, 'Board:', this.player.board);
    // console.log('Is Opponent:', this.isOpponent);
    // if (this.player.board && this.player.board.rows) {
    //   console.log('Board Rows:', Object.keys(this.player.board.rows));
    // } else {
    //   console.warn('Player board or rows are undefined');
    // }
  }

  getRowCells(row: string): ICell[] {
    if (!this.player.board || !this.player.board.rows) {
      // console.warn(`Board or rows undefined for player ${this.player.name}`);
      return [];
    }

    const cells = this.player.board.rows[row.toLowerCase()] || [];
    // console.log(`Player: ${this.player.name}, Row ${row}:`, cells);

    if (this.isOpponent) {
      if (cells.length === 0) {
        console.warn(`No cells found for opponent's row ${row}`);
      }
      const opponentCells = cells.map(cell => ({
        ...cell,
        occupied: false, // Hide opponent's ship placements
        hit: cell.hit,
        miss: cell.miss
      }));

      return opponentCells;
    }

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
    if (cell) {
      this._getCellInfo(cell);
    }
  }

  toggleBoardSetup() {
    if (!this.player.boardSetup!.isFinishedSettingUp) {
      this.player.boardSetup!.isSettingUp = !this.player.boardSetup!.isSettingUp;
      // console.log('boardSetup', this.player.boardSetup!);
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
      console.log('this.player FINISHED SETUP', this.player)
      this._gameService.updatePlayer(this.player);
    }
  }


}