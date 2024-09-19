import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IPlayer } from '../models/game';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _requests = new BehaviorSubject<any>(null);
  requests$: Observable<any> = this._requests.asObservable();

  constructor(
    private _afs: AngularFirestore
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
    return this._afs.collection('/players').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IPlayer;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    )
  }

  getIndividualPlayer(id: string) {
    return this._afs.doc('/players/' + id).valueChanges()
  }

  deletePlayer(player: IPlayer) {
    return this._afs.doc('/players/' + player.id).delete()
  }

  updatePlayer(player: IPlayer) {
    return this._afs.doc('/players/' + player.id).update(player)
  }

  challengePlayer(player: IPlayer) {
    return this._afs.doc('/players/' + player.id).update(player)
  }

  sendRequests(requestId: string, playerId: string, playerName: string, opponentId: string, opponentName: string) {
    return this._afs.collection('/requests').add({ requestId, playerId, playerName, opponentId, opponentName, accepted: false })
  }

  acceptRequest(requestId: string) {
    return this._afs.doc('/requests/' + requestId).update({ accepted: true })
  }

  getRequests() {
    return this._afs.collection('/requests').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    )
  }
}