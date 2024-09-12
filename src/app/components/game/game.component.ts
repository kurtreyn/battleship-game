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
  // use these properties, not the ones above
  player!: IPlayer
  opponent!: IPlayer
  isOpponent: boolean = false;
  gameStarted: boolean = false;



  constructor(private _boardService: BoardService, private _gameService: GameService) { }


  ngOnInit(): void {
    this._initializePlayers();
  }

  onPlayerCellClick(cell: ICell) { }

  onOpponentCellClick(cell: ICell) {

  }

  private _initializePlayers(): void {
    this.player = this._createPlayer('Player');
    this.opponent = this._createPlayer('Opponent');

  }

  private _createPlayer(name: string): IPlayer {
    const board = this._boardService.createBoard();
    return {
      playerId: 'pID221a5xr',
      name,
      email: '',
      isReady: false,
      board,
      shipLocations: this._boardService.initializeShipLocations(),
      boardSetup: this._boardService.initializeBoardSetup(),
    }
  }
}



