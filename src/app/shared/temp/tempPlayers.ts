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
    isReady: true,
    score: 0,
}

export const oppShipLocations: IShipLocations = {
    battleship: ['c8', 'd8', 'e8', 'f8'],
    carrier: ['f2', 'f3', 'f4', 'f5', 'f6'],
    cruiser: ['c5', 'd5', 'e5'],
    destroyer: ['g9', 'h9'],
    submarine: ['i4', 'i5', 'i6']
}

export const oppShipArray: string[] = ['c8', 'd8', 'e8', 'f8', 'f2', 'f3', 'f4', 'f5', 'f6', 'c5', 'd5', 'e5', 'g9', 'h9', 'i4', 'i5', 'i6']

