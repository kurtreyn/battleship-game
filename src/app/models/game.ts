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
    playerNumber: string;
}

export interface ISession {
    sessionId: string;
    date: string;
    time: string;
    players: IPlayer[];
}

export interface ICell {
    x: string,
    y: string,
    row_label: string,
    coordinates: string,
    occupied: boolean,
    boardOwner: string,
    playerId: string,
    opponentId: string,
    hit: boolean,
    miss: boolean,
}

export interface IBoardSetup {
    isSettingUp: boolean;
    carrierSet: boolean;
    battleshipSet: boolean;
    cruiserSet: boolean;
    submarineSet: boolean;
    destroyerSet: boolean;
}