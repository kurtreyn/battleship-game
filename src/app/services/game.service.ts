import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ICell, IBoardSetup, IShipLocations, IPlayer } from '../models/game';
import { GAME } from '../enums/enums';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private _player = new BehaviorSubject<IPlayer | null>(null);
  private _opponent = new BehaviorSubject<IPlayer | null>(null);
  player$: Observable<IPlayer | null> = this._player.asObservable();
  opponent$: Observable<IPlayer | null> = this._opponent.asObservable();

  constructor() { }

  updatePlayer(player: IPlayer): void {
    try {
      this._player.next(player);
    } catch (error) {
      console.error('Error updating player:', error);
    }
  }

  updateOpponent(opponent: IPlayer): void {
    try {
      this._opponent.next(opponent);
    } catch (error) {
      console.error('Error updating opponent:');
    }
  }

  getPlayer(): IPlayer | null {
    return this._player.getValue();
  }

  getOpponent(): IPlayer | null {
    return this._opponent.getValue();
  }

  attack(coordinates: string) {
    const opponent = this.getOpponent();
    const player = this.getPlayer();
    console.log('player', player);
    if (!opponent || !player) {
      return;
    }
    if (opponent?.shipArray?.includes(coordinates) && opponent.board !== undefined) {
      const cell = opponent.board.cells.find(cell => cell.coordinates === coordinates);
      // console.log('cell', cell);
      if (cell) {
        cell.hit = true;
        this.updateOpponent({
          ...opponent,
          board: {
            ...opponent.board,
            cells: [...opponent.board.cells],
            rows: opponent.board!.rows
          }
        });

        if (!!player.score) {
          if (player.score < GAME.WINNING_SCORE) {
            this.updatePlayer({
              ...player,
              score: player.score! + 1
            })
          }

          if (player.score === GAME.WINNING_SCORE) {
            this.updatePlayer({
              ...player,
              isWinner: true
            })
          }
        }


      }
    } else {
      const cell = opponent?.board!.cells.find(cell => cell.coordinates === coordinates);
      // console.log('cell', cell);
      if (cell) {
        cell.miss = true;
        this.updateOpponent({
          ...opponent,
          board: {
            ...opponent!.board!,
            cells: [...opponent!.board!.cells],
            rows: opponent!.board!.rows
          }
        });


      }
    }
  }
}
