import { Component, OnInit } from '@angular/core';
import { ICell } from 'src/app/models/game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  row: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  col: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  cells: ICell[] = [];

  ngOnInit(): void {
    this.initializeCells('Kurt', 'pID', 'oID');
    console.log('cells', this.cells);
  }

  initializeCells(boardOwner: string, playerId: string, opponentId: string): void {
    for (let i = 0; i < this.row.length; i++) {
      for (let j = 0; j < this.col.length; j++) {
        this.cells.push({
          location_row: this.row[i],
          location_col: this.col[j],
          coordinates: `${this.row[i]}${this.col[j]}`,
          row_label: this.row[i].toUpperCase(),
          occupied: false,
          boardOwner: boardOwner,
          playerId: playerId,
          opponentId: opponentId,
          hit: false,
          miss: false
        });
      }
    }
  }


}
