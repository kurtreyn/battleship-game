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


  getRowLabels(): string[] {
    return Array.from(new Set(this.cells.map(cell => cell.row_label)));
  }

  getCols(): string[] {
    return Array.from(new Set(this.cells.map(cell => cell.location_col)));
  }

  getCell(row: string, col: string): any {
    return this.cells.find(cell => cell.location_row === row && cell.location_col === col);
  }

  getClassForCell(row: string, col: string): string {
    const cell = this.getCell(row, col);
    if (!cell) return '';
    return [
      cell.hit ? 'hit' : '',
      cell.miss ? 'miss' : '',
      cell.occupied ? 'occupied' : ''
    ].join(' ');
  }

  onCellClick(cell: any) {
    if (cell) {
      console.log('Cell clicked:', cell);
      // Implement the logic for what happens when a cell is clicked.
    }
  }


}
