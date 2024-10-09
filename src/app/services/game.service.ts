import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { IPlayer } from '../models/game';

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
    console.log('Game Service updating player:', player.name);
    try {
      this._player.next(player);
    } catch (error) {
      console.error('Error updating player:', error);
    }
  }

  updateOpponent(opponent: IPlayer): void {
    console.log('Game Service updating opponent:', opponent.name);
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
