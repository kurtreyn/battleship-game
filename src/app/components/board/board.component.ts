import { Component, Input } from '@angular/core';
import { ICell, IBoardSetup } from 'src/app/models/game';
import { SHIP_LEN, SHIP_NAME, SHIP_SETUP } from 'src/app/enums/enums';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
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

  location: string[] = [];
  isDragging: boolean = false;

  onCellMouseDown(cell: ICell) {
    this.isDragging = true;
    this.addCellToLocation(cell);
  }

  onCellMouseUp() {
    this.isDragging = false;
  }

  onCellMouseEnter(cell: ICell) {
    if (this.isDragging) {
      this.addCellToLocation(cell);
    }
    console.log('Location:', this.location);
    this.updateCell(cell);
  }

  addCellToLocation(cell: ICell) {
    const conditions = {
      isOccupied: cell.occupied,
      not_existing: !this.location.includes(cell.coordinates),
      isSettingUp: this.boardSetup.isSettingUp
    }
    if (!conditions.isOccupied && conditions.not_existing && conditions.isSettingUp) {
      const newCoordinate = cell.coordinates;

      if (this.location.length === 0) {
        this.location.push(newCoordinate);
      } else {
        const firstCoordinate = this.location[0];
        const isSameRow = this.location.every((loc) => loc[0] === newCoordinate[0]);
        const isSameCol = this.location.every((loc) => loc[1] === newCoordinate[1]);

        if (isSameRow && newCoordinate[0] === firstCoordinate[0]) {
          this.location.push(newCoordinate);
        } else if (isSameCol && newCoordinate[1] === firstCoordinate[1]) {
          this.location.push(newCoordinate);
        } else {
          this.location = [];
        }
      }
    }
  }



  updateCell(cell: ICell) {
    if (this.location.length === 0) return;
    this.location.forEach((loc) => {
      this.cells.forEach((cell) => {
        if (cell.coordinates === loc) {
          cell.occupied = true;
        }
      });
    });
    this.location = [];
    // console.log('Cells:', this.cells);
  }

  onCellClick(cell: ICell) {
    if (cell) {
      this.getCellInfo(cell);
      // Implement the logic for what happens when a cell is clicked.
    }
  }

  getCellInfo(cell: ICell) {
    const cellInfo: ICell = {
      location_row: cell.location_row,
      location_col: cell.location_col,
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
