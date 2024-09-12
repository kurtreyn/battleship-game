import { Component, OnInit } from '@angular/core';
import { BoardService } from '../../services/board.service'
import { GameService } from 'src/app/services/game.service';
import { ICell, IBoardSetup, IShipLocations, IPlayer } from 'src/app/models/game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  cells: ICell[] = [];
  rowArr: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  colArr: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  row_A: ICell[] = []
  row_B: ICell[] = []
  row_C: ICell[] = []
  row_D: ICell[] = []
  row_E: ICell[] = []
  row_F: ICell[] = []
  row_G: ICell[] = []
  row_H: ICell[] = []
  row_I: ICell[] = []
  row_J: ICell[] = []
  boardSetup: IBoardSetup = {
    isSettingUp: false,
    carrierSet: false,
    battleshipSet: false,
    cruiserSet: false,
    submarineSet: false,
    destroyerSet: false,
    settingShip: '',
    isFinishedSettingUp: false
  }
  shipLocations: IShipLocations = {
    carrier: [],
    battleship: [],
    cruiser: [],
    submarine: [],
    destroyer: []
  }
  player: IPlayer = {
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
  opponent: IPlayer = {
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

  constructor(private _boardService: BoardService, private _gameService: GameService) { }


  ngOnInit(): void {
    this._initializeCells('Kurt', 'pID221a5xr', 'oID55xz8n9b');
    this._setRows();
    console.log('initial boardSetup', this.boardSetup);
  }

  private _initializeCells(boardOwner: string, playerId: string, opponentId: string): void {
    for (let i = 0; i < this.rowArr.length; i++) {
      for (let j = 0; j < this.colArr.length; j++) {
        const xString = this.rowArr[i];
        const xInt = this._boardService.convertToNumber(xString);
        const yInt = parseInt(this.colArr[j])

        this.cells.push({
          x: xInt,
          y: yInt,
          coordinates: `${this.rowArr[i]}${this.colArr[j]}`,
          row_label: this.rowArr[i].toUpperCase(),
          occupied: false,
          hit: false,
          miss: false
        });
      }
    }
  }

  private _setRows(): void {
    if (!this.cells) return;
    this.cells.forEach((cell) => {
      switch (cell.row_label) {
        case 'A':
          this.row_A.push(cell);
          break;
        case 'B':
          this.row_B.push(cell);
          break;
        case 'C':
          this.row_C.push(cell);
          break;
        case 'D':
          this.row_D.push(cell);
          break;
        case 'E':
          this.row_E.push(cell);
          break;
        case 'F':
          this.row_F.push(cell);
          break;
        case 'G':
          this.row_G.push(cell);
          break;
        case 'H':
          this.row_H.push(cell);
          break;
        case 'I':
          this.row_I.push(cell);
          break;
        case 'J':
          this.row_J.push(cell);
          break;
      }
    });
  }
}



