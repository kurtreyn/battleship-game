import { Injectable } from '@angular/core';
import { ICell } from '../models/game';
import { SHIP_LEN, SHIP_NAME } from '../enums/enums';

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

  getShipLength(ship: string) {
    switch (ship) {
      case SHIP_NAME.CARRIER:
        return SHIP_LEN.CARRIER;
      case SHIP_NAME.BATTLESHIP:
        return SHIP_LEN.BATTLESHIP;
      case SHIP_NAME.CRUISER:
        return SHIP_LEN.CRUISER;
      case SHIP_NAME.SUBMARINE:
        return SHIP_LEN.SUBMARINE;
      case SHIP_NAME.DESTROYER:
        return SHIP_LEN.DESTROYER;
      default:
        return 0;
    }
  }

  getShipName(ship: string) {
    switch (ship) {
      case SHIP_NAME.CARRIER:
        return SHIP_NAME.CARRIER;
      case SHIP_NAME.BATTLESHIP:
        return SHIP_NAME.BATTLESHIP;
      case SHIP_NAME.CRUISER:
        return SHIP_NAME.CRUISER;
      case SHIP_NAME.SUBMARINE:
        return SHIP_NAME.SUBMARINE;
      case SHIP_NAME.DESTROYER:
        return SHIP_NAME.DESTROYER;
      default:
        return '';
    }
  }

  resetCells(cells: ICell[]) {
    cells.forEach(cell => {
      cell.occupied = false;
      cell.hit = false;
      cell.miss = false;
    });
  }

  convertToNumber(char: string): number {
    const coordKey: { [key: string]: number } = {
      'a': 1,
      'b': 2,
      'c': 3,
      'd': 4,
      'e': 5,
      'f': 6,
      'g': 7,
      'h': 8,
      'i': 9,
      'j': 10,
    };
    return coordKey[char];
  }

  convertToString(num: number): string {
    const coordKey: { [key: number]: string } = {
      1: 'a',
      2: 'b',
      3: 'c',
      4: 'd',
      5: 'e',
      6: 'f',
      7: 'g',
      8: 'h',
      9: 'i',
      10: 'j',
    };
    return coordKey[num];
  }
}