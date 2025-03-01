import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { take } from 'rxjs/operators';
import { IPlayer, IGame } from 'src/app/models/game';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  @Input() activePlayers?: IPlayer[];
  @Input() player?: IPlayer;
  @Input() opponent?: IPlayer;
  @Input() showModal!: boolean;
  @Input() modalMessage!: string;

  constructor(
    private _gameService: GameService,
    private _dataService: DataService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  toggleActiveStatus(): void {
    if (this.player) {
      const updatedPlayer = { ...this.player, isActive: !this.player.isActive };
      this._dataService.updatePlayer(updatedPlayer);
      if (this.player.id) {
        this._dataService.getIndividualPlayer(this.player.id).pipe(
          take(1)
        )
          .subscribe(player => {
            if (player) {
              const updatedPlayerData = player as IPlayer;
              this._gameService.updatePlayer(updatedPlayerData);
            }
          })

      }
    }
  }


  challengePlayer(opponentId: string, opponentName: string): void {
    this._dataService.getRequests().pipe(
      take(1)
    ).subscribe(requests => {
      const requestId = this._gameService.generateId();
      if (requests) {
        const requestExists = requests.some((request: any) => {
          return request.challengerId === this.player?.playerId && request.opponentId === opponentId;
        });
        if (requestExists) {
          alert(`You have already sent a challenge to ${opponentName}. Please wait for their response.`);
          return;
        } else {
          if (this.player) {
            const newGameDetails = {
              playerOne: this.player,
              playerOneId: this.player.playerId,
              playerOneName: this.player.name,
              playerTwoId: opponentId,
              playerTwoName: opponentName,
              playerTwoResponded: false,
              playerTwoAccepted: false,
              requestId: requestId,
            } as IGame;

            this._dataService.requestGame(newGameDetails);
            alert(`Challenge sent to ${opponentName}. Please wait for their response.`);
          }
        }
      }
    })
  }

}
