export interface Player {
    id: string;
    name: string;
    isTurn: boolean;
    isWinner: boolean;
    score: number;
}

export interface Layout {
    a1: string;
    a2: string;
}