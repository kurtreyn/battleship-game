import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { IPlayer, IGame } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private _player = new BehaviorSubject<IPlayer | null>(null);
  private _opponent = new BehaviorSubject<IPlayer | null>(null);
  private _game = new BehaviorSubject<IGame | null>(null);
  player$: Observable<IPlayer | null> = this._player.asObservable();
  opponent$: Observable<IPlayer | null> = this._opponent.asObservable();
  game$: Observable<IGame | null> = this._game.asObservable();

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

  updatePlayerAndOpponent(player: IPlayer, opponent: IPlayer): void {
    try {
      this._player.next(player);
      this._opponent.next(opponent);
    } catch (error) {
      console.error('Error updating player and opponent:', error);
    }
  }

  getPlayer(): IPlayer | null {
    return this._player.getValue();
  }

  getOpponent(): IPlayer | null {
    return this._opponent.getValue();
  }

  setGame(game: IGame): void {
    this._game.next(game);
  }

  getGame(): IGame | null {
    return this._game.getValue();
  }

  updateGame(game: IGame): void {
    try {
      this._game.next(game);
    } catch (error) {
      console.error('Error updating game:', error);
    }
  }
}