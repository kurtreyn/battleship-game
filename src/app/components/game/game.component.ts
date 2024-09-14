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
  // isOpponent: boolean = false;
  gameStarted: boolean = true;

  private _playerSubscription!: Subscription;
  private _opponentSubscription!: Subscription;



  constructor(private _boardService: BoardService, private _gameService: GameService) { }


  ngOnInit(): void {
    this._subscribeToPlayerUpdates();
    this._initializePlayer();
  }

  ngOnDestroy(): void {
    this._playerSubscription.unsubscribe();
    this._opponentSubscription.unsubscribe();
  }

  onPlayerCellClick(cell: ICell) { }

  onOpponentCellClick(cell: ICell) { }

  // onCellClicked(event: { player: IPlayer, cell: ICell }) {
  //   console.log(`${event.player.name} clicked cell:`, event.cell);
  //   if (this.gameStarted) {
  //     this._gameService.attack(event.player, event.cell.coordinates);
  //   }
  // }

  private _initializePlayer(): void {
    const player = this._createPlayer(tempPlayer);
    const board = this._boardService.createBoard(player);
    this._gameService.updatePlayer(player);
    const newTempOpp = {
      ...tempOpponent,
      board: board,
      shipLocations: oppShipLocations,
      shipArray: oppShipArray,
      boardSetup: oppBoardSetup,
      isReady: true
    }
    const opponent = this._createPlayer(newTempOpp);
    this._gameService.updateOpponent(opponent);
  }

  private _createPlayer(player: IPlayer): IPlayer {
    const board = this._boardService.createBoard(player);
    return {
      playerId: player.playerId,
      name: player.name,
      email: player.email,
      isReady: player.isReady,
      board,
      shipLocations: this._boardService.initializeShipLocations(),
      boardSetup: this._boardService.initializeBoardSetup(),
      shipArray: oppShipArray
    }
  }

  private _subscribeToPlayerUpdates(): void {
    this._playerSubscription = this._gameService.player$.subscribe(player => {
      if (player) {
        this.player = player

        if (this.player.isReady) {
          this.gameStarted = true;
        }
      };
    });

    this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
      if (opponent) {
        this.opponent = opponent
        console.log('opponent', this.opponent);
      };
    });
  }
}



