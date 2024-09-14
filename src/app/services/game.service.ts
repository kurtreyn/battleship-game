import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ICell, IBoardSetup, IShipLocations, IPlayer } from '../models/game';

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
    this._player.next(player);
  }

  updateOpponent(opponent: IPlayer): void {
    this._opponent.next(opponent);
  }

  getPlayer(): IPlayer | null {
    return this._player.getValue();
  }

  getOpponent(): IPlayer | null {
    return this._opponent.getValue();
  }

  attack(player: IPlayer, coordinates: string) {
    const opponent = this.getOpponent();
    console.log('opponent', opponent);
    console.log(`Player ${player.name} attacked ${coordinates}`);
    if (opponent?.shipArray?.includes(coordinates)) {
      console.log('HIT!');
      const cell = opponent.board!.cells.find(cell => cell.coordinates === coordinates);
      console.log('cell', cell);
      if (cell) {
        cell.hit = true;
        this.updateOpponent({
          ...opponent,
          board: {
            ...opponent.board,
            cells: [...opponent.board!.cells],
            rows: opponent.board!.rows
          }
        });
      }
    } else {
      console.log('MISS!');
      const cell = opponent?.board!.cells.find(cell => cell.coordinates === coordinates);
      console.log('cell', cell);
      if (cell) {
        cell.miss = true;
        // this.updateOpponent({
        //    ...opponent, 
        //    board: { ...opponent.board, 
        //     cells: [...opponent.board!.cells], 
        //     rows: opponent.board!.rows 
        //   } 
        // });
      }
    }
  }
}
