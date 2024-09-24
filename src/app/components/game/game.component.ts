import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from '../../services/board.service'
import { GameService } from 'src/app/services/game.service';
import { IPlayer } from 'src/app/models/game';
import { GAME } from '../../enums/enums'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  player!: IPlayer
  opponent!: IPlayer
  @Input() sessionId!: string;
  @Input() gameStarted!: boolean;
  @Input() gameCompleted!: boolean;
  @Input() lastUpdated!: number;
  winningScore: number = GAME.WINNING_SCORE;

  private _playerSubscription!: Subscription;
  private _opponentSubscription!: Subscription;



  constructor(
    private _boardService: BoardService,
    private _gameService: GameService
  ) { }


  ngOnInit(): void {
    this._subscribeToPlayerUpdates();
  }

  ngOnDestroy(): void {
    this._playerSubscription.unsubscribe();
    this._opponentSubscription.unsubscribe();
  }



  private _subscribeToPlayerUpdates(): void {
    this._playerSubscription = this._gameService.player$.subscribe(player => {
      if (player) {
        this.player = player
        // console.log('THIS.PLAYER IN GAME COMPONENT', this.player);
      };
    });

    this._opponentSubscription = this._gameService.opponent$.subscribe(opponent => {
      // console.log('opponent in game component', opponent);
      if (opponent) {
        this.opponent = opponent
        // console.log('THIS.OPPONENT IN GAME COMPONENT', this.opponent);
      };
    });
  }
}



