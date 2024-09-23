import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from '../../services/board.service'
import { GameService } from 'src/app/services/game.service';
import { ICell, IPlayer } from 'src/app/models/game';
import { tempPlayer, tempOpponent, oppShipLocations, oppShipArray, oppBoardSetup, oppCells } from 'src/app/shared/temp/tempPlayers';
import { GAME } from '../../enums/enums'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  @Input() player!: IPlayer
  @Input() opponent!: IPlayer
  @Input() gameStarted!: boolean;
  @Input() gameCompleted!: boolean;
  winningScore: number = GAME.WINNING_SCORE;

  // private _playerSubscription!: Subscription;
  // private _opponentSubscription!: Subscription;



  constructor(
    private _boardService: BoardService,
    private _gameService: GameService
  ) { }


  ngOnInit(): void {
    // this._subscribeToPlayerUpdates();
    // this._initializePlayer();
    console.log('player in game component', this.player);
  }

  ngOnDestroy(): void {
    // this._playerSubscription.unsubscribe();
    // this._opponentSubscription.unsubscribe();
  }

  // onPlayerCellClick(cell: ICell) { }

  // onOpponentCellClick(cell: ICell) { }


  // private _initializePlayer(): void {
  //   const player = this._createPlayer(this.player);
  //   this._gameService.updatePlayer(player);
  //   console.log('player', player);

  // }

  // private _createPlayer(player: IPlayer): IPlayer {
  //   const board = this._boardService.createBoard(player);
  //   return {
  //     playerId: player.playerId,
  //     name: player.name,
  //     email: player.email,
  //     isReady: player.isReady,
  //     score: player.score,
  //     board,
  //     shipLocations: this._boardService.initializeShipLocations(),
  //     boardSetup: this._boardService.initializeBoardSetup(),
  //     shipArray: oppShipArray
  //   }
  // }

  // private _subscribeToPlayerUpdates(): void {
  //   this._playerSubscription = this._gameService.player$.subscribe(player => {
  //     if (player) {
  //       this.player = player
  //       if (this.player.isReady && this.opponent.isReady) {
  //         this.gameStarted = true;
  //       }

  //       if (this.opponent) {
  //         if (this.player.score === this.winningScore || this.opponent.score === this.winningScore) {
  //           this.gameCompleted = true;
  //         }
  //       }
  //     };
  //   });

  //   this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
  //     if (opponent) {
  //       this.opponent = opponent
  //       // console.log('opponent', this.opponent);
  //     };
  //   });
  // }
}



