import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  @Input() row: string[] = [];
  @Input() col: string[] = [];
  @Input() gridState: { [key: string]: string } = {};
  @Input() boardIds: string[][] = [];

  onCellClick(cellId: string) {
    // Here you would implement the logic for a move
    // For now, let's just toggle between 'hit' and 'miss'
    this.gridState[cellId] = this.gridState[cellId] === 'hit' ? 'miss' : 'hit';
  }


}
