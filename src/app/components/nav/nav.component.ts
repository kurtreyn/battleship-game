import { Component, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  @Output() onLogout = new EventEmitter<void>();

  constructor(

  ) { }

  ngOnInit(): void {
  }

  logOut() {
    this.onLogout.emit();
  }

}
