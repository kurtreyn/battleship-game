export interface IPlayer {
    playerId: string;
    name: string;
    email: string;
    isTurn: boolean;
    isWinner: boolean;
    isActive: boolean;
    isReady: boolean;
    score: number;
    session?: ISession;
    playerNumber: number;
}

export interface ISession {
    sessionId: string;
    date: string;
    time: string;
    players: IPlayer[];
}

export interface ICell {
    location_row: string,
    location_col: string,
    row_label: string,
    coordinates: string,
    occupied: boolean,
    boardOwner: string,
    playerId: string,
    opponentId: string,
    hit: boolean,
    miss: boolean,
}