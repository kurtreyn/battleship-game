import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  row: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  col: string[] = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  boardIds: string[][] = [];
  gridState: { [key: string]: string } = {};

  ngOnInit(): void {
    this.initializeGrid();
  }


  initializeGrid() {
    for (let i = 1; i < this.row.length; i++) {
      for (let j = 1; j < this.col.length; j++) {
        this.gridState[this.row[i] + this.col[j]] = 'empty';
      }
    }
  }


}
