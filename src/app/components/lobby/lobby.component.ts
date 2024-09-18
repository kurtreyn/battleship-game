import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { IPlayer } from 'src/app/models/game';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  @Input() activePlayers?: IPlayer[];
  @Input() player?: IPlayer;
  @Input() opponent?: IPlayer;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
