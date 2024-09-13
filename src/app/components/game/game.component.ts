import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from '../../services/board.service'
import { GameService } from 'src/app/services/game.service';
import { ICell, IPlayer } from 'src/app/models/game';
import { tempPlayer, tempOpponent, oppShipLocations, oppShipArray, oppBoardSetup, oppCells } from 'src/app/shared/temp/tempPlayers';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  player!: IPlayer
  opponent!: IPlayer
  isOpponent: boolean = false;
  gameStarted: boolean = false;

  private _playerSubscription!: Subscription;
  private _opponentSubscription!: Subscription;



  constructor(private _boardService: BoardService, private _gameService: GameService) { }


  ngOnInit(): void {
    this._subscribeToPlayerUpdates();
    this._initializePlayers();
  }

  ngOnDestroy(): void {
    this._playerSubscription.unsubscribe();
    this._opponentSubscription.unsubscribe();
  }

  onPlayerCellClick(cell: ICell) { }

  onOpponentCellClick(cell: ICell) {

  }

  private _initializePlayers(): void {
    const player = this._createPlayer(tempPlayer);
    const opponent = this._createPlayer(tempOpponent);
    this._gameService.updatePlayer(player);
    this._gameService.updateOpponent(opponent);

  }

  private _createPlayer(player: IPlayer): IPlayer {
    const board = this._boardService.createBoard();
    return {
      playerId: player.playerId,
      name: player.name,
      email: player.email,
      isReady: player.isReady,
      board,
      shipLocations: this._boardService.initializeShipLocations(),
      boardSetup: this._boardService.initializeBoardSetup(),
    }
  }

  private _subscribeToPlayerUpdates(): void {
    this._playerSubscription = this._gameService.player$.subscribe(player => {
      console.log('Player', player);
      if (player) {
        this.player = player
        console.log('THIS.PLAYER', this.player);

        // TODO: this is a temp means of setting the opponent
        if (this.player.isReady && !this.opponent.isReady) {
          console.log('--PLAYER IS READY--');
          const updatedOpponent = {
            ...this.opponent,
            board: {
              cells: oppCells,
              rows: this._boardService.setRows(oppCells),
            },
            isReady: true,
            shipLocations: oppShipLocations,
            shipArray: oppShipArray,
            boardSetup: oppBoardSetup,
          }
          console.log('Updated Opponent', updatedOpponent);
          this._gameService.updateOpponent(updatedOpponent);
          this.gameStarted = true;
        }
      };
    });

    this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
      if (opponent) {
        this.opponent = opponent
      };
    });
  }
}



