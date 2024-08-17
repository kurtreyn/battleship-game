import { Component, Input } from '@angular/core';
import { ICell } from 'src/app/models/game';

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
    if (!this.location.includes(cell.coordinates)) {
      this.location.push(cell.coordinates);
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
    console.log('Cells:', this.cells);
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

  setShips() {
    const location = [];
  }


}
