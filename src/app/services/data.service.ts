import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { v4 as uuidv4 } from 'uuid';
import { IPlayer } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private afs: AngularFirestore) { }

  addPlayer(player: IPlayer) {
    player.playerId = uuidv4()
    player.email = player.email
    player.name = player.name
    return this.afs.collection('/players').add(player)
  }

  getAllPlayers() {
    return this.afs.collection('/players').snapshotChanges()
  }

  deletePlayer(player: IPlayer) {
    return this.afs.doc('/players/' + player.playerId).delete()
  }

  updatePlayer(player: IPlayer) {
    this.deletePlayer(player);
    this.addPlayer(player);
  }
}