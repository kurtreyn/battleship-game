import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { v4 as uuidv4 } from 'uuid';
import { IPlayer } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private _afs: AngularFirestore) { }

  addPlayer(player: IPlayer) {
    player.name = player.name
    player.email = player.email
    player.isReady = player.isReady
    player.score = player.score
    player.readyToEnterGame = player.readyToEnterGame

    return this._afs.collection('/players').add(player)
  }

  getAllPlayers() {
    return this._afs.collection('/players').snapshotChanges()
  }

  deletePlayer(player: IPlayer) {
    return this._afs.doc('/players/' + player.playerId).delete()
  }

  updatePlayer(player: IPlayer) {
    this.deletePlayer(player);
    this.addPlayer(player);
  }
}