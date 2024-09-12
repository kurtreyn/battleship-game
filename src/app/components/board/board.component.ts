import { Component, Input, OnInit } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { GameService } from 'src/app/services/game.service';
import { ICell, IBoardSetup, IShipLocations, IPlayer } from '../../models/game';
import { SHIP_LEN, SHIP_NAME } from '../../enums/enums';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  @Input() cells: ICell[] = [];
  @Input() row_A: ICell[] = [];
  @Input() row_B: ICell[] = [];
  @Input() row_C: ICell[] = [];
  @Input() row_D: ICell[] = [];
  @Input() row_E: ICell[] = [];
  @Input() row_F: ICell[] = [];
  @Input() row_G: ICell[] = [];
  @Input() row_H: ICell[] = [];
  @Input() row_I: ICell[] = [];
  @Input() row_J: ICell[] = [];
  @Input() boardSetup!: IBoardSetup;
  @Input() shipLocations: IShipLocations = {
    carrier: [],
    battleship: [],
    cruiser: [],
    submarine: [],
    destroyer: []
  }
  @Input() player: IPlayer = {
    playerId: '',
    name: '',
    email: '',
    isTurn: false,
    isWinner: false,
    isActive: false,
    isReady: false,
    score: 0,
    playerNumber: '',
  }
  @Input() opponent: IPlayer = {
    playerId: '',
    name: '',
    email: '',
    isTurn: false,
    isWinner: false,
    isActive: false,
    isReady: false,
    score: 0,
    playerNumber: '',
  }
  rows: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  stagingLocation: string[] = [];
  usedCells: string[] = [];
  shipsToSet: string[] = [SHIP_NAME.CARRIER, SHIP_NAME.BATTLESHIP, SHIP_NAME.CRUISER, SHIP_NAME.SUBMARINE, SHIP_NAME.DESTROYER];
  isDragging: boolean = false;
  dragStartCell: ICell | null = null;
  dragEndCell: ICell | null = null;
  currentShipLength: number = 0;

  constructor(private _boardService: BoardService, private _gameService: GameService) { }



  ngOnInit(): void {
    this.boardSetup.settingShip = this.shipsToSet[0];
    this.currentShipLength = this._boardService.getShipLength(this.boardSetup.settingShip);
  }

  getRowCells(row: string): ICell[] {
    // setup the rows on the board
    switch (row) {
      case 'A': return this.row_A;
      case 'B': return this.row_B;
      case 'C': return this.row_C;
      case 'D': return this.row_D;
      case 'E': return this.row_E;
      case 'F': return this.row_F;
      case 'G': return this.row_G;
      case 'H': return this.row_H;
      case 'I': return this.row_I;
      case 'J': return this.row_J;
      default: return [];
    }
  }

  onMouseDown(cell: ICell) {
    // check if the board is in setup mode and the cell is not occupied in order to begin setting the ship
    if (this.boardSetup.isSettingUp && !cell.occupied) {
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
    if (!this.boardSetup.isFinishedSettingUp) {
      this.boardSetup.isSettingUp = !this.boardSetup.isSettingUp;
      console.log('boardSetup', this.boardSetup);
    } else {
      this._setPlayerAsReady();
      console.log('Player is ready', this.player);
    }

  }

  hasShipBeenSet(ship: string): boolean {
    // used to determine if a ship has been set in order to apply the appropriate css class on which ship is currently being set and which ships have been set
    switch (ship) {
      case SHIP_NAME.CARRIER:
        return this.boardSetup.carrierSet;
      case SHIP_NAME.BATTLESHIP:
        return this.boardSetup.battleshipSet;
      case SHIP_NAME.CRUISER:
        return this.boardSetup.cruiserSet;
      case SHIP_NAME.SUBMARINE:
        return this.boardSetup.submarineSet;
      case SHIP_NAME.DESTROYER:
        return this.boardSetup.destroyerSet;
      default:
        return false;
    }
  }

  resetBoard() {
    this.cells.forEach(cell => {
      cell.occupied = false;
      cell.hit = false;
      cell.miss = false;
      cell.highlighted = false;
    });
    this.boardSetup = {
      isSettingUp: false,
      carrierSet: false,
      battleshipSet: false,
      cruiserSet: false,
      submarineSet: false,
      destroyerSet: false,
      settingShip: '',
      isFinishedSettingUp: false
    }
    this.shipLocations = {
      carrier: [],
      battleship: [],
      cruiser: [],
      submarine: [],
      destroyer: []
    }
    this.boardSetup.settingShip = this.shipsToSet[0];
    this.currentShipLength = this._boardService.getShipLength(this.boardSetup.settingShip);
  }

  private _setPlayerAsReady() {
    this.player.isReady = true;

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
    console.log('Cell Info:', cellInfo);
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
    this.cells.forEach(cell => cell.highlighted = false);
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
      const cell = this.cells.find(c => c.x === x && c.y === y);
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
    switch (this.boardSetup.settingShip) {
      case SHIP_NAME.CARRIER:
        this.shipLocations.carrier = coordinates;
        this.boardSetup.carrierSet = true;
        break;
      case SHIP_NAME.BATTLESHIP:
        this.shipLocations.battleship = coordinates;
        this.boardSetup.battleshipSet = true;
        break;
      case SHIP_NAME.CRUISER:
        this.shipLocations.cruiser = coordinates;
        this.boardSetup.cruiserSet = true;
        break;
      case SHIP_NAME.SUBMARINE:
        this.shipLocations.submarine = coordinates;
        this.boardSetup.submarineSet = true;
        break;
      case SHIP_NAME.DESTROYER:
        this.shipLocations.destroyer = coordinates;
        this.boardSetup.destroyerSet = true;
        break;
    }
  }

  private _updateSettingShip() {
    if (this.boardSetup.isSettingUp) {
      if (!this.boardSetup.carrierSet) {
        this.boardSetup.settingShip = SHIP_NAME.CARRIER;
        this.currentShipLength = SHIP_LEN.CARRIER;
      } else if (!this.boardSetup.battleshipSet) {
        this.boardSetup.settingShip = SHIP_NAME.BATTLESHIP;
        this.currentShipLength = SHIP_LEN.BATTLESHIP;
      } else if (!this.boardSetup.cruiserSet) {
        this.boardSetup.settingShip = SHIP_NAME.CRUISER;
        this.currentShipLength = SHIP_LEN.CRUISER;
      } else if (!this.boardSetup.submarineSet) {
        this.boardSetup.settingShip = SHIP_NAME.SUBMARINE;
        this.currentShipLength = SHIP_LEN.SUBMARINE;
      } else if (!this.boardSetup.destroyerSet) {
        this.boardSetup.settingShip = SHIP_NAME.DESTROYER;
        this.currentShipLength = SHIP_LEN.DESTROYER;
      } else {
        this.boardSetup.isSettingUp = false;
        this.boardSetup.isFinishedSettingUp = true;
      }
    }

    if (this.boardSetup.isFinishedSettingUp) {
      console.log('this.shipLocations', this.shipLocations);
      console.log('this.boardSetup', this.boardSetup);
    }
  }


}