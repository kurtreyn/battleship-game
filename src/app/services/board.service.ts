import { Injectable } from '@angular/core';
import { ICell, IPlayer, IBoard, IShipLocations, IBoardSetup } from '../models/game';
import { SHIP_LEN, SHIP_NAME } from '../enums/enums';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  rowArr: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  colArr: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  constructor() { }

  createBoard(player: IPlayer): IBoard {
    const cells = this._initializeCells(player);
    const rows = this._initializeRows(cells);
    return { cells, rows };
  }

  getCellInfo(cell: ICell): ICell {
    return {
      x: cell.x,
      y: cell.y,
      coordinates: cell.coordinates,
      occupied: cell.occupied,
      hit: cell.hit,
      miss: cell.miss,
      highlighted: cell.highlighted,
      row_label: cell.row_label
    };
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

  // initializePlayer(inputPlayer: IPlayer): IPlayer {
  //   return {
  //     playerId: inputPlayer.playerId,
  //     name: inputPlayer.name,
  //     email: inputPlayer.email,
  //     isTurn: inputPlayer.isTurn,
  //     isWinner: inputPlayer.isWinner,
  //     isActive: inputPlayer.isActive,
  //     isReady: inputPlayer.isReady,
  //     score: inputPlayer.score,
  //     playerNumber: inputPlayer.playerNumber,
  //     shipLocations: inputPlayer.shipLocations,
  //     board: inputPlayer.board
  //   };
  // }

  // initializeBoard(rowArr: string[], colArr: string[], cells: ICell[]) {
  //   for (let i = 0; i < rowArr.length; i++) {
  //     for (let j = 0; j < colArr.length; j++) {
  //       const xString = rowArr[i];
  //       const xInt = this.convertToNumber(xString);
  //       const yInt = parseInt(colArr[j]);

  //       cells.push({
  //         x: xInt,
  //         y: yInt,
  //         coordinates: `${rowArr[i]}${colArr[j]}`,
  //         row_label: rowArr[i].toUpperCase(),
  //         occupied: false,
  //         hit: false,
  //         miss: false
  //       })
  //     }
  //   }
  // }

  // createRows(cells: ICell[]): { [key: string]: ICell[] } {
  //   const rows: { [key: string]: ICell[] } = {};
  //   this.rowArr.forEach(row => {
  //     rows[row] = cells.filter(cell => cell.coordinates.startsWith(row));
  //   });
  //   return rows;
  // }

  // setRows(cells: ICell[]): { [key: string]: ICell[] } {
  //   if (!cells) return {};

  //   const rows: { [key: string]: ICell[] } = {
  //     A: [], B: [], C: [], D: [], E: [],
  //     F: [], G: [], H: [], I: [], J: []
  //   };

  //   cells.forEach(cell => {
  //     const rowLabel = cell.row_label.toUpperCase();
  //     if (rowLabel in rows) {
  //       rows[rowLabel].push(cell);
  //     }
  //   });

  //   return rows;
  // }

  initializeShipLocations(): IShipLocations {
    return {
      carrier: [],
      battleship: [],
      cruiser: [],
      submarine: [],
      destroyer: []
    };
  }

  initializeBoardSetup(): IBoardSetup {
    return {
      isSettingUp: false,
      carrierSet: false,
      battleshipSet: false,
      cruiserSet: false,
      submarineSet: false,
      destroyerSet: false,
      settingShip: '',
      isFinishedSettingUp: false
    };
  }

  private _initializeCells(player: IPlayer): ICell[] {
    const cells: ICell[] = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        cells.push({
          x,
          y,
          coordinates: `${this.rowArr[y]}${this.colArr[x]}`,
          occupied: false,
          hit: false,
          miss: false,
          highlighted: false,
          playerId: player.playerId,
          row_label: this.rowArr[y].toUpperCase()
        });
      }
    }
    return cells;
  }

  private _initializeRows(cells: ICell[]): { [key: string]: ICell[] } {
    const rows: { [key: string]: ICell[] } = {};
    this.rowArr.forEach(row => {
      rows[row] = cells.filter(cell => cell.coordinates.startsWith(row));
    });
    return rows;
  }
}