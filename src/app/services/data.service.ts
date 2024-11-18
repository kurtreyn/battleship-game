import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IPlayer, IGame } from '../models/game';
import { map, take, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _game = new BehaviorSubject<IGame | null>(null);
  game$: Observable<IGame | null> = this._game.asObservable();

  constructor(
    private _afs: AngularFirestore,
  ) { }

  addPlayer(player: IPlayer) {
    player.name = player.name
    player.email = player.email
    player.isReady = player.isReady
    player.score = player.score
    player.readyToEnterGame = player.readyToEnterGame

    return this._afs.collection('/players').add(player)
  }

  getAllPlayers() {
    return from(this._afs.collection('/players').snapshotChanges()).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IPlayer;
        const id = a.payload.doc.id;
        return { id, ...data };
      })),
      catchError(error => {
        console.error('Error fetching players:', error);
        throw error; // Re-throw the error after logging it
      })
    );
  }

  getIndividualPlayer(id: string) {
    return this._afs.doc('/players/' + id).valueChanges().pipe(
      catchError(error => {
        console.error('Error fetching player:', error);
        return of(null); // Return a fallback value or handle the error as needed
      })
    );
  }

  getPlayerById(playerId: string): Observable<IPlayer> {
    const foundPlayer = this._afs.collection('players', ref => ref.where('playerId', '==', playerId))
      .valueChanges()
      .pipe(
        take(1),
        map(players => players[0] as IPlayer)
      );
    return foundPlayer;
  }

  deletePlayer(player: IPlayer) {
    return this._afs.doc('/players/' + player.id).delete()
  }

  resetPlayer(player: IPlayer) {
    const defaultPlayerValues = {
      email: player.email,
      id: player.id,
      isActive: player.isActive,
      isReady: false,
      isTurn: false,
      isWinner: false,
      name: player.name,
      playerId: player.playerId,
      readyToEnterGame: false,
      score: 0,
    } as IPlayer;
    return this._afs.doc('/players/' + player.id).update(defaultPlayerValues);

  }


  updatePlayer(player: IPlayer) {
    return from(this._afs.doc('/players/' + player.id).update(player)).pipe(
      catchError(error => {
        console.error('Error updating player:', error);
        return of(null); // Return a fallback value or handle the error as needed
      })
    );
  }

  challengePlayer(player: IPlayer) {
    return from(this._afs.doc('/players/' + player.id).update(player)).pipe(
      catchError(error => {
        console.error('Error challenging player:', error);
        return of(null); // Return a fallback value or handle the error as needed
      })
    );
  }

  // sendRequests(requestId: string, challengerId: string, challengerName: string, opponentId: string, opponentName: string) {
  //   return from(this._afs.collection('/requests').add({
  //     requestId,
  //     challengerId,
  //     challengerName,
  //     opponentId,
  //     opponentName,
  //     accepted: false,
  //     responded: false,
  //     gameStarted: false,
  //     lastUpdated: new Date().getTime(),
  //     gameEnded: false
  //   })).pipe(
  //     catchError(error => {
  //       console.error('Error sending request:', error);
  //       return of(null); // Return a fallback value or handle the error as needed
  //     })
  //   );
  // }

  requestGame(gameDetails: IGame) {
    return from(this._afs.collection('/games').add(gameDetails)).pipe(
      catchError(error => {
        console.error('Error requesting game:', error);
        return of(null); // Return a fallback value or handle the error as needed
      })
    );
  }

  updateGame(game: IGame) {
    return from(this._afs.doc('/games/' + game.requestId).update(game)).pipe(
      catchError(error => {
        console.error('Error updating game:', error);
        return of(null); // Return a fallback value or handle the error as needed
      })
    );
  }

  getGameUpdates() {
    return this._afs.collection('/games').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IGame;
        const id = a.payload.doc.id;
        return { id, ...data };
      })),
      catchError(error => {
        console.error('Error fetching game updates:', error);
        return of([]); // Return a fallback value or handle the error as needed
      })
    );
  }

  sendUpdate(requestId: string, responded: boolean, accepted: boolean, gameStarted?: boolean, lastUpdated?: number, gameEnded?: boolean) {
    return from(this._afs.doc('/games/' + requestId).update({
      responded: responded,
      accepted: accepted,
      gameStarted: gameStarted,
      lastUpdated: lastUpdated,
      gameEnded: gameEnded
    })).pipe(
      catchError(error => {
        console.error('Error sending update:', error);
        return of(null); // Return a fallback value or handle the error as needed
      })
    );
  }

  respondToRequest(requestId: string, responded: boolean, accepted: boolean, gameStarted?: boolean) {
    return from(this._afs.doc('/games/' + requestId).update({ responded: responded, accepted: accepted, gameStarted: gameStarted })).pipe(
      catchError(error => {
        console.error('Error responding to request:', error);
        return of(null); // Return a fallback value or handle the error as needed
      })
    );
  }

  getRequests() {
    return this._afs.collection('/games').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      })),
      catchError(error => {
        console.error('Error fetching game requests:', error);
        return of([]); // Return a fallback value or handle the error as needed
      })
    );
  }

  deleteRequest(requestId: string) {
    return from(this._afs.doc('/games/' + requestId).delete()).pipe(
      catchError(error => {
        console.error('Error deleting request:', error);
        return of(null); // Return a fallback value or handle the error as needed
      })
    );
  }

}