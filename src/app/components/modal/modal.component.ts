import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Output() onClose = new EventEmitter<void>();
  @Output() onChalleneResponse = new EventEmitter<boolean>();
  @Output() onStartBoardSetup = new EventEmitter<boolean>();
  @Input() modalMessage: string = '';
  @Input() beginSetupMode!: boolean;


  constructor() { }

  close() {
    this.onClose.emit();
  }

  respond(response: boolean) {
    if (this.beginSetupMode) {
      this.onStartBoardSetup.emit(response);
    } else {
      this.onChalleneResponse.emit(response);
    }
  }



}
