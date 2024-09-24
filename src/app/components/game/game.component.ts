import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AbstractGame } from '../../shared/game/abstractGame'
import { Subscription } from 'rxjs';
import { BoardService } from '../../services/board.service'
import { GameService } from 'src/app/services/game.service';
import { IPlayer } from 'src/app/models/game';
import { GAME } from '../../enums/enums'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent extends AbstractGame {

}



