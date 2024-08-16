import { Component, Input } from '@angular/core';
import { ICell } from 'src/app/models/game';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  @Input() cells: ICell[] = [];


  getRows(): string[] {
    return Array.from(new Set(this.cells.map(cell => cell.location_row)));
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
