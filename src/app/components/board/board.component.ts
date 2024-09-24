import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractGame } from '../../shared/game/abstractGame';
import { Subscription } from 'rxjs';
import { BoardService } from '../../services/board.service';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { ICell, IPlayer } from '../../models/game';
import { SHIP_LEN, SHIP_NAME } from '../../enums/enums';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent extends AbstractGame {

  @Input() isOpponent: boolean = false;



}