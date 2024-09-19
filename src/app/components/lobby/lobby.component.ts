import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { take } from 'rxjs/operators';
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

  constructor(
    private _gameService: GameService,
    private _dataService: DataService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  toggleActiveStatus(): void {
    console.log('clicked')
    if (this.player) {
      const updatedPlayer = { ...this.player, isActive: !this.player.isActive };
      // console.log('updated player', updatedPlayer)
      this._dataService.updatePlayer(updatedPlayer);
      // console.log('this.player', this.player)
      if (this.player.id) {
        this._dataService.getIndividualPlayer(this.player.id).pipe(
          take(1)
        )
          .subscribe(player => {
            // console.log('updated player', player)
            if (player) {
              const updatedPlayerData = player as IPlayer;
              this._gameService.updatePlayer(updatedPlayerData);
            }
          })

      }

      // this._dataService.getIndividualPlayer(this.player.playerId).pipe(
      //   take(1)
      // )
      //   .subscribe(player => {
      //     console.log('updated player', player)
      //   })

      // this._gameService.updatePlayer(updatedPlayer);
    }
  }

}
