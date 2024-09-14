export interface IPlayer {
    playerId: string;
    name: string;
    email: string;
    isReady: boolean;
    score: number;
    isTurn?: boolean;
    isWinner?: boolean;
    isActive?: boolean;
    session?: ISession;
    playerNumber?: string;
    shipLocations?: IShipLocations;
    shipArray?: string[];
    board?: IBoard;
    boardSetup?: IBoardSetup;
}

export interface IBoard {
    cells: ICell[];
    rows: { [key: string]: ICell[] };
}

export interface ISession {
    sessionId: string;
    date: string;
    time: string;
    players: IPlayer[];
}

export interface ICell {
    x: number,
    y: number,
    row_label: string,
    coordinates: string,
    occupied: boolean,
    hit: boolean,
    miss: boolean,
    playerId?: string,
    highlighted?: boolean,
    isSelected?: boolean
}

export interface IBoardSetup {
    isSettingUp: boolean;
    carrierSet: boolean;
    battleshipSet: boolean;
    cruiserSet: boolean;
    submarineSet: boolean;
    destroyerSet: boolean;
    settingShip: string;
    isFinishedSettingUp?: boolean;
}

export interface IShipLocations {
    carrier?: string[];
    battleship?: string[];
    cruiser?: string[];
    submarine?: string[];
    destroyer?: string[];
}