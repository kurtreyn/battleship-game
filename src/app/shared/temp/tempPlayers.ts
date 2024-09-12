import { ICell, IBoardSetup, IShipLocations, IPlayer } from 'src/app/models/game';

export const tempPlayer = {
    playerId: 'pID221a5xr',
    name: 'Kurt',
    email: 'kurt@email.com',
    isTurn: false,
    isWinner: false,
    isActive: true,
    isReady: false,
    score: 0,
}

export const tempOpponent = {
    playerId: 'oID55xz8n9b',
    name: 'Derek',
    email: 'derek@email.com',
    isTurn: false,
    isWinner: false,
    isActive: true,
    isReady: false,
    score: 0,
}

export const oppShipLocations: IShipLocations = {
    battleship: ['b10', 'c10', 'd10', 'e10'],
    carrier: ['b1', 'b2', 'b3', 'b4', 'b5'],
    cruiser: ['h1', 'h2', 'h3'],
    destroyer: ['e5', 'f5'],
    submarine: ['j7', 'j8', 'j9']
}

export const oppShipArray: string[] = ['b10', 'c10', 'd10', 'e10', 'b1', 'b2', 'b3', 'b4', 'b5', 'h1', 'h2', 'h3', 'e5', 'f5', 'j7', 'j8', 'j9']

export const oppBoardSetup: IBoardSetup = {
    battleshipSet: true,
    carrierSet: true,
    cruiserSet: true,
    destroyerSet: true,
    isFinishedSettingUp: true,
    isSettingUp: false,
    settingShip: "destroyer",
    submarineSet: true
}

export const oppCells: ICell[] = [
    {
        coordinates: "a1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 0,
        y: 0,
    },
    {
        coordinates: "a2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 1,
        y: 0,
    },
    {
        coordinates: "a3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 2,
        y: 0,
    },
    {
        coordinates: "a4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 3,
        y: 0,
    },
    {
        coordinates: "a5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 4,
        y: 0,
    },
    {
        coordinates: "a6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 5,
        y: 0,
    },
    {
        coordinates: "a7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 6,
        y: 0,
    },
    {
        coordinates: "a8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 7,
        y: 0,
    },
    {
        coordinates: "a9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 8,
        y: 0,
    },
    {
        coordinates: "a10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "A",
        x: 9,
        y: 0,
    },
    {
        coordinates: "b1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "B",
        x: 0,
        y: 1,
    },
    {
        coordinates: "b2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "B",
        x: 1,
        y: 1,
    },
    {
        coordinates: "b3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "B",
        x: 2,
        y: 1,
    },
    {
        coordinates: "b4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "B",
        x: 3,
        y: 1,
    },
    {
        coordinates: "b5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "B",
        x: 4,
        y: 1,
    },
    {
        coordinates: "b6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "B",
        x: 5,
        y: 1,
    },
    {
        coordinates: "b7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "B",
        x: 6,
        y: 1,
    },
    {
        coordinates: "b8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "B",
        x: 7,
        y: 1,
    },
    {
        coordinates: "b9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "B",
        x: 8,
        y: 1,
    },
    {
        coordinates: "b10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "B",
        x: 9,
        y: 1,
    },
    {
        coordinates: "c1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 0,
        y: 2,
    },
    {
        coordinates: "c2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 1,
        y: 2,
    },
    {
        coordinates: "c3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 2,
        y: 2,
    },
    {
        coordinates: "c4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 3,
        y: 2,
    },
    {
        coordinates: "c5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 4,
        y: 2,
    },
    {
        coordinates: "c6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 5,
        y: 2,
    },
    {
        coordinates: "c7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 6,
        y: 2,
    },
    {
        coordinates: "c8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 7,
        y: 2,
    },
    {
        coordinates: "c9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "C",
        x: 8,
        y: 2,
    },
    {
        coordinates: "c10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "C",
        x: 9,
        y: 2,
    },
    {
        coordinates: "d1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 0,
        y: 3,
    },
    {
        coordinates: "d2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 1,
        y: 3,
    },
    {
        coordinates: "d3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 2,
        y: 3,
    },
    {
        coordinates: "d4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 3,
        y: 3,
    },
    {
        coordinates: "d5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 4,
        y: 3,
    },
    {
        coordinates: "d6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 5,
        y: 3,
    },
    {
        coordinates: "d7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 6,
        y: 3,
    },
    {
        coordinates: "d8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 7,
        y: 3,
    },
    {
        coordinates: "d9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "D",
        x: 8,
        y: 3,
    },
    {
        coordinates: "d10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "D",
        x: 9,
        y: 3,
    },
    {
        coordinates: "e1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 0,
        y: 4,
    },
    {
        coordinates: "e2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 1,
        y: 4,
    },
    {
        coordinates: "e3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 2,
        y: 4,
    },
    {
        coordinates: "e4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 3,
        y: 4,
    },
    {
        coordinates: "e5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 4,
        y: 4,
    },
    {
        coordinates: "e6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 5,
        y: 4,
    },
    {
        coordinates: "e7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 6,
        y: 4,
    },
    {
        coordinates: "e8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 7,
        y: 4,
    },
    {
        coordinates: "e9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "E",
        x: 8,
        y: 4,
    },
    {
        coordinates: "e10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "E",
        x: 9,
        y: 4,
    },
    {
        coordinates: "f1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 0,
        y: 5,
    },
    {
        coordinates: "f2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 1,
        y: 5,
    },
    {
        coordinates: "f3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 2,
        y: 5,
    },
    {
        coordinates: "f4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 3,
        y: 5,
    },
    {
        coordinates: "f5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 4,
        y: 5,
    },
    {
        coordinates: "f6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 5,
        y: 5,
    },
    {
        coordinates: "f7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 6,
        y: 5,
    },
    {
        coordinates: "f8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 7,
        y: 5,
    },
    {
        coordinates: "f9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "F",
        x: 8,
        y: 5,
    },
    {
        coordinates: "f10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "F",
        x: 9,
        y: 5,
    },
    {
        coordinates: "g1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 0,
        y: 6,
    },
    {
        coordinates: "g2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 1,
        y: 6,
    },
    {
        coordinates: "g3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 2,
        y: 6,
    },
    {
        coordinates: "g4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 3,
        y: 6,
    },
    {
        coordinates: "g5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 4,
        y: 6,
    },
    {
        coordinates: "g6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 5,
        y: 6,
    },
    {
        coordinates: "g7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 6,
        y: 6,
    },
    {
        coordinates: "g8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 7,
        y: 6,
    },
    {
        coordinates: "g9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 8,
        y: 6,
    },
    {
        coordinates: "g10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "G",
        x: 9,
        y: 6,
    },
    {
        coordinates: "h1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "H",
        x: 0,
        y: 7,
    },
    {
        coordinates: "h2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "H",
        x: 1,
        y: 7,
    },
    {
        coordinates: "h3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "H",
        x: 2,
        y: 7,
    },
    {
        coordinates: "h4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "H",
        x: 3,
        y: 7,
    },
    {
        coordinates: "h5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "H",
        x: 4,
        y: 7,
    },
    {
        coordinates: "h6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "H",
        x: 5,
        y: 7,
    },
    {
        coordinates: "h7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "H",
        x: 6,
        y: 7,
    },
    {
        coordinates: "h8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "H",
        x: 7,
        y: 7,
    },
    {
        coordinates: "h9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "H",
        x: 8,
        y: 7,
    },
    {
        coordinates: "h10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "H",
        x: 9,
        y: 7,
    },
    {
        coordinates: "i1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 0,
        y: 8,
    },
    {
        coordinates: "i2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 1,
        y: 8,
    },
    {
        coordinates: "i3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 2,
        y: 8,
    },
    {
        coordinates: "i4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 3,
        y: 8,
    },
    {
        coordinates: "i5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 4,
        y: 8,
    },
    {
        coordinates: "i6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 5,
        y: 8,
    },
    {
        coordinates: "i7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 6,
        y: 8,
    },
    {
        coordinates: "i8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 7,
        y: 8,
    },
    {
        coordinates: "i9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 8,
        y: 8,
    },
    {
        coordinates: "i10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "I",
        x: 9,
        y: 8,
    },
    {
        coordinates: "j1",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "J",
        x: 0,
        y: 9,
    },
    {
        coordinates: "j2",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "J",
        x: 1,
        y: 9,
    },
    {
        coordinates: "j3",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "J",
        x: 2,
        y: 9,
    },
    {
        coordinates: "j4",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "J",
        x: 3,
        y: 9,
    },
    {
        coordinates: "j5",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "J",
        x: 4,
        y: 9,
    },
    {
        coordinates: "j6",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "J",
        x: 5,
        y: 9,
    },
    {
        coordinates: "j7",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "J",
        x: 6,
        y: 9,
    },
    {
        coordinates: "j8",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "J",
        x: 7,
        y: 9,
    },
    {
        coordinates: "j9",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: true,
        row_label: "J",
        x: 8,
        y: 9,
    },
    {
        coordinates: "j10",
        highlighted: false,
        hit: false,
        miss: false,
        occupied: false,
        row_label: "J",
        x: 9,
        y: 9,
    },
];


