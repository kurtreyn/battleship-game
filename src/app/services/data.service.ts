import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IPlayer } from '../models/game';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

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
}