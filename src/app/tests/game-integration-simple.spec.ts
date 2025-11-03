// This file contains simplified integration tests focused on the core bug fixes
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { AbstractGame } from '../shared/game/abstractGame';
import { GameService } from '../services/game.service';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { BoardService } from '../services/board.service';
import { IPlayer } from '../models/game';
import { GAME } from '../enums/enums';

// Test implementation of AbstractGame
@Component({
    template: ''
})
class TestGameComponent extends AbstractGame {
    constructor(
        gameService: GameService,
        dataService: DataService,
        authService: AuthService,
        boardService: BoardService
    ) {
        super(gameService, dataService, authService, boardService);
    }
}

describe('Game Integration Tests', () => {
    let component: TestGameComponent;
    let gameService: jasmine.SpyObj<GameService>;
    let dataService: jasmine.SpyObj<DataService>;
    let authService: jasmine.SpyObj<AuthService>;
    let boardService: jasmine.SpyObj<BoardService>;

    const mockPlayer1: any = {
        id: 'player1',
        playerId: 'auth-player1',
        name: 'Player1',
        email: 'player1@test.com',
        isReady: false,
        score: 0,
        readyToEnterGame: false,
        finishedSetup: false,
        isTurn: false,
        isWinner: false,
        isActive: true,
        session: '',
        lastUpdated: Date.now()
    };

    const mockPlayer2: any = {
        id: 'player2',
        playerId: 'auth-player2',
        name: 'Player2',
        email: 'player2@test.com',
        isReady: false,
        score: 0,
        readyToEnterGame: false,
        finishedSetup: false,
        isTurn: false,
        isWinner: false,
        isActive: true,
        session: '',
        lastUpdated: Date.now()
    };

    beforeEach(async () => {
        const gameServiceSpy = jasmine.createSpyObj('GameService', [
            'generateId', 'setPlayer', 'updatePlayer', 'updateOpponent',
            'updatePlayerAndOpponent', 'getPlayer', 'getOpponent'
        ], {
            player$: new BehaviorSubject<IPlayer | null>(null),
            opponent$: new BehaviorSubject<IPlayer | null>(null)
        });

        const dataServiceSpy = jasmine.createSpyObj('DataService', [
            'addPlayer', 'getAllPlayers', 'getIndividualPlayer', 'getPlayerById',
            'deletePlayer', 'updatePlayer', 'challengePlayer', 'sendRequests',
            'sendUpdate', 'respondToRequest', 'getRequests', 'deleteRequest', 'resetPlayer'
        ]);

        const authServiceSpy = jasmine.createSpyObj('AuthService', [
            'getCurrentUser', 'login', 'register', 'logout', 'forgotPassword'
        ]);

        const boardServiceSpy = jasmine.createSpyObj('BoardService', [
            'createBoard', 'getCellInfo', 'getShipLength', 'getShipName',
            'resetCells', 'convertToNumber', 'convertToString',
            'initializeShipLocations', 'initializeBoardSetup'
        ]);

        await TestBed.configureTestingModule({
            declarations: [TestGameComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: DataService, useValue: dataServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: BoardService, useValue: boardServiceSpy }
            ]
        }).compileComponents();

        const fixture = TestBed.createComponent(TestGameComponent);
        component = fixture.componentInstance;

        gameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        boardService = TestBed.inject(BoardService) as jasmine.SpyObj<BoardService>;

        // Setup default mock returns
        authService.getCurrentUser.and.returnValue(of({ uid: 'auth-player1' } as any));
        dataService.getAllPlayers.and.returnValue(of([mockPlayer1, mockPlayer2]));
        dataService.getRequests.and.returnValue(of([]));
        dataService.updatePlayer.and.returnValue(of(null));
        dataService.deleteRequest.and.returnValue(of(null));
        dataService.sendUpdate.and.returnValue(of(null));
        dataService.respondToRequest.and.returnValue(of(null));
        boardService.createBoard.and.returnValue({ cells: [], rows: {} });
        boardService.initializeShipLocations.and.returnValue({});
        boardService.initializeBoardSetup.and.returnValue({
            isSettingUp: false,
            carrierSet: false,
            battleshipSet: false,
            cruiserSet: false,
            submarineSet: false,
            destroyerSet: false,
            settingShip: '',
            isFinishedSettingUp: false
        });
        gameService.generateId.and.returnValue('test-request-id');

        component.player = { ...mockPlayer1 };
        component.opponent = { ...mockPlayer2 };
    });

    describe('Bug Fix Verification', () => {
        it('should prevent cross-player ready state contamination (Bug Fix)', () => {
            // Setup: Player 1 is current user, Player 2 is opponent
            component.player = { ...mockPlayer1, playerId: 'auth-player1' };
            component.opponent = { ...mockPlayer2, playerId: 'auth-player2' };

            // Scenario: Player 2 becomes ready, but Player 1 should not be affected
            const readyPlayer2 = { ...mockPlayer2, isReady: true, finishedSetup: true };
            const unchangedPlayer1 = { ...mockPlayer1, isReady: false, finishedSetup: false };

            // Call the method that was causing the bug
            (component as any)._checkAndUpdatePlayers(unchangedPlayer1, readyPlayer2, 'player1', Date.now());

            // Verify that only the current player's data is processed
            expect(gameService.updatePlayer).toHaveBeenCalledWith(unchangedPlayer1);

            // Verify that the opponent's ready state doesn't contaminate the current player
            const playerUpdate = gameService.updatePlayer.calls.mostRecent().args[0];
            expect(playerUpdate.isReady).toBeFalse();
            expect(playerUpdate.finishedSetup).toBeFalse();
        });

        it('should properly cleanup game on completion (Bug Fix)', () => {
            jasmine.clock().install();

            component.requestId = 'test-request-id';
            component.playerOne = { ...mockPlayer1 };
            component.playerTwo = { ...mockPlayer2 };

            const winner = { ...mockPlayer1, score: GAME.WINNING_SCORE };
            spyOn(component as any, '_resetGame');

            (component as any)._updateWinner(winner);

            expect(component.gameCompleted).toBeTrue();

            // Advance timer to trigger cleanup
            jasmine.clock().tick(4001);

            // Verify Firebase request is deleted
            expect(dataService.deleteRequest).toHaveBeenCalledWith('test-request-id');

            // Verify both players are reset
            expect((component as any)._resetGame).toHaveBeenCalledWith(mockPlayer1);
            expect((component as any)._resetGame).toHaveBeenCalledWith(mockPlayer2);

            jasmine.clock().uninstall();
        });

        it('should reset all player fields properly on game reset (Bug Fix)', () => {
            component.requestId = 'test-request-id';

            const playerToReset = {
                ...mockPlayer1,
                readyToEnterGame: true,
                session: 'active-session',
                score: 10,
                finishedSetup: true,
                isReady: true,
                isWinner: true,
                isTurn: true
            };

            (component as any)._resetGame(playerToReset);

            expect(dataService.deleteRequest).toHaveBeenCalledWith('test-request-id');
            expect(boardService.createBoard).toHaveBeenCalledWith(playerToReset);
            expect(dataService.updatePlayer).toHaveBeenCalled();
            expect(gameService.updatePlayer).toHaveBeenCalled();

            // Verify all fields are properly reset
            const resetPlayerData = gameService.updatePlayer.calls.mostRecent().args[0];
            expect(resetPlayerData.readyToEnterGame).toBeFalse();
            expect(resetPlayerData.session).toBe('');
            expect(resetPlayerData.score).toBe(0);
            expect(resetPlayerData.finishedSetup).toBeFalse();
            expect(resetPlayerData.isReady).toBeFalse();
            expect(resetPlayerData.isWinner).toBeFalse();
            expect(resetPlayerData.isTurn).toBeFalse();
            expect(resetPlayerData.lastUpdated).toBeDefined();

            // Verify properties are reset
            expect(component.gameStarted).toBeFalse();
            expect(component.gameCompleted).toBeFalse();
            expect(component.sessionId).toBe('');
            expect(component.requestId).toBe('');
            expect(component.showLobby).toBeTrue();
            expect(component.showModal).toBeFalse();
        });
    });

    describe('Game Flow', () => {
        it('should handle user login correctly', () => {
            authService.getCurrentUser.and.returnValue(of({ uid: 'auth-player1' } as any));

            component.ngOnInit();

            expect(component.isLoggedIn).toBeTrue();
            expect(component.showLobby).toBeTrue();
        });

        it('should handle game completion with winner', () => {
            jasmine.clock().install();

            const winner = { ...mockPlayer1, score: GAME.WINNING_SCORE };
            spyOn(component as any, '_resetGame');

            (component as any)._updateWinner(winner);

            expect(component.gameCompleted).toBeTrue();
            expect(component.showModal).toBeTrue();
            expect(component.modalMessage).toBe('Player1 has won the game.');

            jasmine.clock().tick(4001);

            expect((component as any)._resetGame).toHaveBeenCalledTimes(2);

            jasmine.clock().uninstall();
        });

        it('should handle game cancellation', () => {
            component.requestId = 'test-request-id';
            component.player = { ...mockPlayer1 };
            spyOn(component as any, '_resetGame');

            component.cancelGame();

            expect(dataService.sendUpdate).toHaveBeenCalledWith(
                'test-request-id', true, true, true, jasmine.any(Number), true
            );
            expect((component as any)._resetGame).toHaveBeenCalledWith(mockPlayer1);
        });
    });

    afterEach(() => {
        component.ngOnDestroy();
    });
});