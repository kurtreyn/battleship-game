import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
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

  generateId(): string {
    return uuidv4();
  }

  setPlayer(player: IPlayer): void {
    this._player.next(player);
  }

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
}
