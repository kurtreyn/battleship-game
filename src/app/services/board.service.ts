import { Injectable } from '@angular/core';
import { ICell } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor() { }



  isVertical(arr: string[]) {
    if (arr.length === 0) return;
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1];
      const curr = arr[i];
      const prevRow = prev.charCodeAt(0);
      const currRow = curr.charCodeAt(0);

      if (prev[1] !== curr[1] || prevRow + 1 !== currRow) {
        return false;
      }
    }
    return true;
  }

  isHorizontal(arr: string[]) {
    if (arr.length === 0) return;
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1];
      const curr = arr[i];
      const prevCol = prev[1];
      const currCol = curr[1];

      if (prev[0] !== curr[0] || parseInt(prevCol) + 1 !== parseInt(currCol)) {
        return false;
      }
    }
    return true
  }

  resetCells(cells: ICell[]) {
    cells.forEach(cell => {
      cell.occupied = false;
      cell.hit = false;
      cell.miss = false;
    });
  }
}
