export interface Player {
    playerId: string;
    name: string;
    email: string;
    isTurn: boolean;
    isWinner: boolean;
    isActive: boolean;
    isReady: boolean;
    score: number;
    session?: Session;
    playerNumber: number;
}

export interface Session {
    sessionId: string;
    date: string;
    time: string;
    players: Player[];
}

export interface Layout {
    a1: string;
    a2: string;
}