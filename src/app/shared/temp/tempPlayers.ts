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
    playerNumber: '1',
    shipLocations: {
        carrier: [],
        battleship: [],
        cruiser: [],
        submarine: [],
        destroyer: []
    },
    shipArray: [],
    board: {}
}

export const tempOpponent = {
    playerId: 'oID55xz8n9b',
    name: 'Opponent',
    email: 'opponent@email.com',
    isTurn: false,
    isWinner: false,
    isActive: true,
    isReady: true,
    score: 0,
    playerNumber: '2',
    shipLocations: {
        carrier: ['a1', 'b1', 'c1', 'd1', 'e1'],
        battleship: ['b5', 'c5', 'd5', 'e5'],
        cruiser: ['c8', 'd8', 'e8'],
        submarine: ['g3', 'g4', 'g5'],
        destroyer: ['i5', 'i6']
    },
    shipArray: ['a1', 'b1', 'c1', 'd1', 'e1', 'b5', 'c5', 'd5', 'e5', 'c8', 'd8', 'e8', 'g3', 'g4', 'g5', 'i5', 'i6'],
    board: {}
}