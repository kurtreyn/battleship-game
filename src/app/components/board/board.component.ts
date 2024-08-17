import { Component, Input, OnInit } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { ICell, IBoardSetup } from '../../models/game';
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

  constructor(private boardService: BoardService) { }

  location: string[] = [];
  shipsToSet: string[] = [SHIP_NAME.CARRIER, SHIP_NAME.BATTLESHIP, SHIP_NAME.CRUISER, SHIP_NAME.SUBMARINE, SHIP_NAME.DESTROYER];
  isDragging: boolean = false;

  ngOnInit(): void {
    this.boardSetup.settingShip = this.shipsToSet[0];
  }

  onCellMouseDown(cell: ICell) {
    this.isDragging = true;
    this.addCellToLocation(cell);
  }

  onCellMouseUp() {
    this.isDragging = false;
    this.updateCell();
    this.updateSettingShip();

  }

  onCellMouseEnter(cell: ICell) {
    let shipLength = 0;
    switch (this.boardSetup.settingShip) {
      case SHIP_NAME.CARRIER:
        shipLength = SHIP_LEN.CARRIER;
        break;
      case SHIP_NAME.BATTLESHIP:
        shipLength = SHIP_LEN.BATTLESHIP;
        break;
      case SHIP_NAME.CRUISER:
        shipLength = SHIP_LEN.CRUISER;
        break;
      case SHIP_NAME.SUBMARINE:
        shipLength = SHIP_LEN.SUBMARINE;
        break;
      case SHIP_NAME.DESTROYER:
        shipLength = SHIP_LEN.DESTROYER;
        break;
      default:
        shipLength = 0;
        break;
    }
    if (this.isDragging && this.location.length <= shipLength) {
      this.addCellToLocation(cell);
    }
  }

  addCellToLocation(cell: ICell) {
    const conditions = {
      isOccupied: cell.occupied,
      not_existing: !this.location.includes(cell.coordinates),
      isSettingUp: this.boardSetup.isSettingUp
    }
    if (!conditions.isOccupied && conditions.not_existing && conditions.isSettingUp) {
      let locationLength = this.location.length;
      console.log('location: ', this.location);
      console.log('isDragging: ', this.isDragging);

      if (locationLength === 0 || locationLength === 1) {
        this.location.push(cell.coordinates);
      } else {
        const isVertical = this.boardService.isVertical(this.location);
        const isHorizontal = this.boardService.isHorizontal(this.location);
        const initialX = this.location[0][0];
        const initialY = this.location[0][1];
        const x = cell.coordinates[0];
        const y = cell.coordinates[1];

        if (isVertical) {
          if (y === initialY && x !== initialX) {
            console.log('pushing: ', cell.coordinates);
            this.location.push(cell.coordinates);
          } else {
            alert('Coordinate is not in a vertical line');
            this.boardService.resetCells(this.cells);
            this.location = [];
          }
        }

        if (isHorizontal) {
          if (x === initialX && y !== initialY) {
            console.log('pushing: ', cell.coordinates);
            this.location.push(cell.coordinates);
          } else {
            alert('Coordinate is not in a horizontal line');
            this.boardService.resetCells(this.cells);
            this.location = [];
          }
        }
        console.log('isVertical: ', isVertical);
        console.log('isHorizontal: ', isHorizontal);
        console.log('initialX: ', initialX);
        console.log('initialY: ', initialY);
        console.log(`x: ${x}, y: ${y}`);
      }
    }
  }


  updateCell() {
    if (this.location.length === 0) return;
    this.location.forEach((loc) => {
      this.cells.forEach((cell) => {
        if (cell.coordinates === loc) {
          cell.occupied = true;
        }
      });
    });
    this.location = [];
  }

  updateSettingShip() {
    // Remove the first ship from the array
    this.shipsToSet.shift();

    // Log the current setting ship
    console.log('settingShip: ', this.boardSetup.settingShip);

    // Update the board setup based on the current setting ship
    switch (this.boardSetup.settingShip) {
      case SHIP_NAME.CARRIER:
        this.boardSetup.carrierSet = true;
        break;
      case SHIP_NAME.BATTLESHIP:
        this.boardSetup.battleshipSet = true;
        break;
      case SHIP_NAME.CRUISER:
        this.boardSetup.cruiserSet = true;
        break;
      case SHIP_NAME.SUBMARINE:
        this.boardSetup.submarineSet = true;
        break;
      case SHIP_NAME.DESTROYER:
        this.boardSetup.destroyerSet = true;
        break;
      default:
        break;
    }

    // Update the settingShip to the next ship in the array, if any
    if (this.shipsToSet.length > 0) {
      this.boardSetup.settingShip = this.shipsToSet[0];
    }
  }

  onCellClick(cell: ICell) {
    if (cell) {
      this.getCellInfo(cell);
    }
  }

  getCellInfo(cell: ICell) {
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

  toggleBoardSetup() {
    this.boardSetup.isSettingUp = !this.boardSetup.isSettingUp;
    console.log('boardSetup', this.boardSetup);
  }
}