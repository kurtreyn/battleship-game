import { Component, OnInit } from '@angular/core';
import { BoardService } from '../../services/board.service'
import { GameService } from 'src/app/services/game.service';
import { ICell, IPlayer } from 'src/app/models/game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
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



