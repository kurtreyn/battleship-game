import { Component } from '@angular/core';
import { AbstractGame } from '../../shared/game/abstractGame'
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends AbstractGame {
  hasAccountMessage: string = 'Already have an account? Click here to login';
  doesNotHaveAccountMessage: string = 'Don\'t have an account? Click here to register';
  gameInstructions: string = `When the circle is green, click on the opponent's board to make a move. The opponent will make a move after you.`;
  waitingInstructions: string = `Waiting for opponent to finish setting up their board.`;


  constructor(
    public gameService: GameService,
    public dataService: DataService,
    public authService: AuthService,
    public boardService: BoardService
  ) {
    super(
      gameService,
      dataService,
      authService,
      boardService
    )
  }

  toggleShowLogin(): void {
    this.showLogin = !this.showLogin;
  }

  toggleShowModal(): void {
    this.showModal = !this.showModal;
  }



}