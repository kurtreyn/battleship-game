import { Component, Input } from '@angular/core';
import { BoardService } from '../../services/board.service'
import { ICell, IBoardSetup, IShipLocations } from 'src/app/models/game';

@Component({
  selector: 'app-ship',
  templateUrl: './ship.component.html',
  styleUrls: ['./ship.component.css']
})
export class ShipComponent {
  @Input() cells: ICell[] = [];
  @Input() boardSetup!: IBoardSetup;
  @Input() shipLocations: IShipLocations = {
    carrier: [],
    battleship: [],
    cruiser: [],
    submarine: [],
    destroyer: []
  }

  constructor(private boardService: BoardService) { }

}
