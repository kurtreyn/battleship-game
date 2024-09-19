import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Output() onClose = new EventEmitter<void>();
  @Output() onChalleneResponse = new EventEmitter<boolean>();
  @Input() modalMessage: string = '';


  constructor() { }

  close() {
    this.onClose.emit();
  }

  respondToChallenge(response: boolean) {
    this.onChalleneResponse.emit(response);
  }



}
