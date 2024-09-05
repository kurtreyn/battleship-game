import { Component, Input, OnInit } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { ICell, IBoardSetup, IShipLocations } from '../../models/game';
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
  rows: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  stagingLocation: string[] = [];
  usedCells: string[] = [];
  shipsToSet: string[] = [SHIP_NAME.CARRIER, SHIP_NAME.BATTLESHIP, SHIP_NAME.CRUISER, SHIP_NAME.SUBMARINE, SHIP_NAME.DESTROYER];
  isDragging: boolean = false;
  dragStartCell: ICell | null = null;
  dragEndCell: ICell | null = null;
  currentShipLength: number = 0;

  constructor(private boardService: BoardService) { }



  ngOnInit(): void {
    this.boardSetup.settingShip = this.shipsToSet[0];
    this.currentShipLength = this.boardService.getShipLength(this.boardSetup.settingShip);
  }

  getRowCells(row: string): ICell[] {
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
    if (this.boardSetup.isSettingUp && !cell.occupied) {
      this.isDragging = true;
      this.dragStartCell = cell;
      this._highlightCells(cell, cell);
    }
  }

  onMouseEnter(cell: ICell) {
    if (this.isDragging && !cell.occupied) {
      this._highlightCells(this.dragStartCell!, cell);
    }
  }

  onMouseUp(cell: ICell) {
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
    this.boardSetup.isSettingUp = !this.boardSetup.isSettingUp;
    console.log('boardSetup', this.boardSetup);
  }

  private _getCellInfo(cell: ICell) {
    const cellInfo: ICell = {
      x: cell.x,
      y: cell.y,
      row_label: cell.row_label,
      coordinates: cell.coordinates,
      occupied: cell.occupied,
      boardOwner: cell.boardOwner,
      playerId: cell.playerId,
      opponentId: cell.opponentId,
      hit: cell.hit,
      miss: cell.miss
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
    console.log('resetting highlight');
    this.cells.forEach(cell => cell.highlighted = false);
  }

  private _getCellsBetween(start: ICell, end: ICell): ICell[] {
    const cells: ICell[] = [];
    const isVertical = start.y === end.y;
    const length = isVertical ? Math.abs(end.x - start.x) + 1 : Math.abs(end.y - start.y) + 1;
    const maxLength = Math.min(length, this.currentShipLength);

    for (let i = 0; i < maxLength; i++) {
      const { x, y } = this._calculateCoordinates(start, end, i, isVertical);
      const cell = this.cells.find(c => c.x === x && c.y === y);
      if (cell) {
        cells.push(cell);
      }
    }
    return cells;
  }

  private _calculateCoordinates(start: ICell, end: ICell, i: number, isVertical: boolean): { x: number, y: number } {
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
    console.log('shipLocations:', this.shipLocations);
    console.log('boardSetup:', this.boardSetup);
  }

  private _updateSettingShip() {
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
      console.log('this.shipLocations', this.shipLocations);
    }
  }
}