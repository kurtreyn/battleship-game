import { TestBed } from '@angular/core/testing';
import { of, BehaviorSubject, Subject } from 'rxjs';
import { AbstractGame } from './abstractGame';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
import { IPlayer, IBoard, IBoardSetup, IShipLocations } from 'src/app/models/game';
import { GAME } from 'src/app/enums/enums';

// Concrete implementation of AbstractGame for testing
class TestableAbstractGame extends AbstractGame {
    constructor(
        gameService: GameService,
        dataService: DataService,
        authService: AuthService,
        boardService: BoardService
    ) {
        super(gameService, dataService, authService, boardService);
    }

    // Expose private methods for testing
    public testHandlePlayerUpdate(player: IPlayer, opponent: IPlayer, playerId: string, currentTime: number) {
        return (this as any)._handlePlayerUpdate(player, opponent, playerId, currentTime);
    }

    public testUpdateWinner(winner: IPlayer) {
        return (this as any)._updateWinner(winner);
    }

    public testResetGame(player: IPlayer) {
        return (this as any)._resetGame(player);
    }

    public testCheckAndUpdatePlayers(playerOne: IPlayer, playerTwo: IPlayer, playerId: string, currentTime: number) {
        return (this as any)._checkAndUpdatePlayers(playerOne, playerTwo, playerId, currentTime);
    }

    public testHasPlayerChanged(player: IPlayer) {
        return (this as any)._hasPlayerChanged(player);
    }

    public testIsPlayerInGame(player: IPlayer) {
        return (this as any)._isPlayerInGame(player);
    }
}

describe('AbstractGame', () => {
    let component: TestableAbstractGame;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockDataService: jasmine.SpyObj<DataService>;
    let mockAuthService: jasmine.SpyObj<AuthService>;
    let mockBoardService: jasmine.SpyObj<BoardService>;

    const mockPlayer: IPlayer = {
        id: 'player1',
        playerId: 'auth-player1',
        name: 'Player 1',
        email: 'player1@test.com',
        isReady: false,
        score: 0,
        readyToEnterGame: false,
        finishedSetup: false,
        isTurn: false,
        isWinner: false,
        isActive: true,
        session: '',
        shipLocations: { carrier: [], battleship: [], cruiser: [], submarine: [], destroyer: [] },
        shipArray: [],
        board: { cells: [], rows: {} },
        boardSetup: {
            isSettingUp: false,
            carrierSet: false,
            battleshipSet: false,
            cruiserSet: false,
            submarineSet: false,
            destroyerSet: false,
            settingShip: '',
            isFinishedSettingUp: false
        },
        lastUpdated: Date.now()
    };

    const mockOpponent: IPlayer = {
        id: 'player2',
        playerId: 'auth-player2',
        name: 'Player 2',
        email: 'player2@test.com',
        isReady: false,
        score: 0,
        readyToEnterGame: false,
        finishedSetup: false,
        isTurn: false,
        isWinner: false,
        isActive: true,
        session: '',
        shipLocations: { carrier: [], battleship: [], cruiser: [], submarine: [], destroyer: [] },
        shipArray: [],
        board: { cells: [], rows: {} },
        boardSetup: {
            isSettingUp: false,
            carrierSet: false,
            battleshipSet: false,
            cruiserSet: false,
            submarineSet: false,
            destroyerSet: false,
            settingShip: '',
            isFinishedSettingUp: false
        },
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
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: DataService, useValue: dataServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: BoardService, useValue: boardServiceSpy }
            ]
        }).compileComponents();

        mockGameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        mockDataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        mockBoardService = TestBed.inject(BoardService) as jasmine.SpyObj<BoardService>;

        component = new TestableAbstractGame(
            mockGameService,
            mockDataService,
            mockAuthService,
            mockBoardService
        );

        // Setup default mock returns
        mockAuthService.getCurrentUser.and.returnValue(of(null));
        mockDataService.getAllPlayers.and.returnValue(of([]));
        mockDataService.getRequests.and.returnValue(of([]));
        mockDataService.updatePlayer.and.returnValue(of(null));
        mockDataService.deleteRequest.and.returnValue(of(null));
        mockBoardService.createBoard.and.returnValue({ cells: [], rows: {} });
        mockBoardService.initializeShipLocations.and.returnValue({});
        mockBoardService.initializeBoardSetup.and.returnValue({
            isSettingUp: false,
            carrierSet: false,
            battleshipSet: false,
            cruiserSet: false,
            submarineSet: false,
            destroyerSet: false,
            settingShip: '',
            isFinishedSettingUp: false
        });
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with correct default values', () => {
            expect(component.gameStarted).toBeFalse();
            expect(component.gameCompleted).toBeFalse();
            expect(component.gameEnded).toBeFalse();
            expect(component.winningScore).toBe(GAME.WINNING_SCORE);
            expect(component.showLogin).toBeFalse();
            expect(component.showLobby).toBeFalse();
            expect(component.showModal).toBeFalse();
            expect(component.isLoggedIn).toBeFalse();
        });
    });

    describe('Game Flow Management', () => {
        beforeEach(() => {
            component.player = { ...mockPlayer };
            component.opponent = { ...mockOpponent };
        });

        it('should handle challenge response acceptance', () => {
            component.requestId = 'test-request-id';
            component.onChallengeResponse(true);

            expect(component.showModal).toBeFalse();
            expect(mockDataService.respondToRequest).toHaveBeenCalledWith('test-request-id', true, true, false);
            expect(mockGameService.updatePlayer).toHaveBeenCalled();
            expect(mockDataService.updatePlayer).toHaveBeenCalled();
        });

        it('should handle challenge response rejection', () => {
            component.requestId = 'test-request-id';
            component.onChallengeResponse(false);

            expect(component.showModal).toBeFalse();
            expect(mockDataService.respondToRequest).toHaveBeenCalledWith('test-request-id', true, false, false);
        });

        it('should handle board setup start', () => {
            component.requestId = 'test-request-id';
            component.onStartBoardSetup(true);

            expect(component.showModal).toBeFalse();
            expect(mockGameService.updatePlayer).toHaveBeenCalled();
            expect(mockDataService.updatePlayer).toHaveBeenCalled();
            expect(mockDataService.respondToRequest).toHaveBeenCalledWith('test-request-id', true, true, true);
        });

        it('should route response events correctly based on setup mode', () => {
            spyOn(component, 'onStartBoardSetup');
            spyOn(component, 'onChallengeResponse');

            component.beginSetupMode = true;
            component.onResponseEvent(true);
            expect(component.onStartBoardSetup).toHaveBeenCalledWith(true);

            component.beginSetupMode = false;
            component.onResponseEvent(false);
            expect(component.onChallengeResponse).toHaveBeenCalledWith(false);
        });
    });

    describe('Player State Management', () => {
        beforeEach(() => {
            component.player = { ...mockPlayer };
        });

        it('should identify if player is in game', () => {
            const playerInGame = { ...mockPlayer, session: 'active-session' };
            const playerNotInGame = { ...mockPlayer, session: '' };

            expect(component.testIsPlayerInGame(playerInGame)).toBeTrue();
            expect(component.testIsPlayerInGame(playerNotInGame)).toBeFalse();
        });

        it('should detect player changes correctly', () => {
            const changedPlayer = { ...mockPlayer, score: 5 };

            // First call should return true (no previous update)
            expect(component.testHasPlayerChanged(mockPlayer)).toBeTrue();

            // After setting last update, same player should return false
            (component as any)._lastPlayerUpdate = mockPlayer;
            expect(component.testHasPlayerChanged(mockPlayer)).toBeFalse();

            // Changed player should return true
            expect(component.testHasPlayerChanged(changedPlayer)).toBeTrue();
        });

        it('should reset player correctly', () => {
            component.resetPlayer();

            expect(mockBoardService.createBoard).toHaveBeenCalledWith(component.player);
            expect(mockDataService.updatePlayer).toHaveBeenCalled();
            expect(mockGameService.updatePlayer).toHaveBeenCalled();

            const updateCall = mockGameService.updatePlayer.calls.mostRecent().args[0];
            expect(updateCall.readyToEnterGame).toBeFalse();
            expect(updateCall.session).toBe('');
            expect(updateCall.score).toBe(0);
            expect(updateCall.finishedSetup).toBeFalse();
            expect(updateCall.isReady).toBeFalse();
            expect(updateCall.isWinner).toBeFalse();
            expect(updateCall.isTurn).toBeFalse();
        });
    });

    describe('Game Completion and Cleanup', () => {
        beforeEach(() => {
            component.player = { ...mockPlayer };
            component.playerOne = { ...mockPlayer };
            component.playerTwo = { ...mockOpponent };
            component.requestId = 'test-request-id';
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should handle winner update and cleanup properly', () => {
            const winner = { ...mockPlayer, score: GAME.WINNING_SCORE };
            spyOn(component, 'testResetGame');

            component.testUpdateWinner(winner);

            expect(component.gameCompleted).toBeTrue();
            expect(component.showModal).toBeTrue();
            expect(component.modalMessage).toBe(`${winner.name} has won the game.`);
            expect(component.requiresUserAction).toBeFalse();
            expect(mockDataService.updatePlayer).toHaveBeenCalled();
            expect(mockGameService.updatePlayer).toHaveBeenCalled();

            // Advance the timer to trigger cleanup
            jasmine.clock().tick(4001);

            expect(mockDataService.deleteRequest).toHaveBeenCalledWith('test-request-id');
            expect(component.testResetGame).toHaveBeenCalledWith(component.playerOne!);
            expect(component.testResetGame).toHaveBeenCalledWith(component.playerTwo!);
        });

        it('should reset game state properly', () => {
            const testPlayer = { ...mockPlayer };
            component.requestId = 'test-request-id';

            component.testResetGame(testPlayer);

            expect(mockDataService.deleteRequest).toHaveBeenCalledWith('test-request-id');
            expect(mockBoardService.createBoard).toHaveBeenCalledWith(testPlayer);
            expect(mockDataService.updatePlayer).toHaveBeenCalled();
            expect(mockGameService.updatePlayer).toHaveBeenCalled();

            expect(component.gameStarted).toBeFalse();
            expect(component.gameCompleted).toBeFalse();
            expect(component.sessionId).toBe('');
            expect(component.requestId).toBe('');
            expect(component.showLobby).toBeTrue();
            expect(component.showModal).toBeFalse();
        });

        it('should cancel game properly', () => {
            spyOn(component, 'testResetGame');
            component.requestId = 'test-request-id';

            component.cancelGame();

            expect(mockDataService.sendUpdate).toHaveBeenCalledWith(
                'test-request-id', true, true, true, jasmine.any(Number), true
            );
            expect(component.testResetGame).toHaveBeenCalledWith(component.player);
        });
    });

    describe('Player Update Logic (Bug Fix Verification)', () => {
        beforeEach(() => {
            component.player = { ...mockPlayer, id: 'player1', playerId: 'auth-player1' };
        });

        it('should only update current player data when it belongs to them', () => {
            const currentPlayer = { ...mockPlayer, id: 'player1', playerId: 'auth-player1', score: 3 };
            const opponent = { ...mockOpponent, id: 'player2', playerId: 'auth-player2' };
            const currentTime = Date.now();

            component.testHandlePlayerUpdate(currentPlayer, opponent, 'player1', currentTime);

            expect(mockGameService.updatePlayer).toHaveBeenCalledWith(currentPlayer);
            expect(mockGameService.updateOpponent).toHaveBeenCalledWith(opponent);
        });

        it('should not update player data when it belongs to opponent', () => {
            const currentPlayer = { ...mockPlayer, id: 'player1', playerId: 'auth-player1' };
            const opponent = { ...mockOpponent, id: 'player2', playerId: 'auth-player2', score: 3 };
            const currentTime = Date.now();

            // Reset the spy to clear any previous calls
            mockGameService.updatePlayer.calls.reset();

            component.testHandlePlayerUpdate(opponent, currentPlayer, 'player2', currentTime);

            // Should not update the local player with opponent's data
            expect(mockGameService.updatePlayer).not.toHaveBeenCalledWith(opponent);
        });

        it('should only process updates for current logged-in player', () => {
            const playerOne = { ...mockPlayer, playerId: 'auth-player1' };
            const playerTwo = { ...mockOpponent, playerId: 'auth-player2' };
            const currentTime = Date.now();

            spyOn(component, 'testHandlePlayerUpdate');

            // When current player is playerOne
            component.player = playerOne;
            component.testCheckAndUpdatePlayers(playerOne, playerTwo, 'player1', currentTime);
            expect(component.testHandlePlayerUpdate).toHaveBeenCalledWith(playerOne, playerTwo, 'player1', currentTime);

            // Reset spy
            (component.testHandlePlayerUpdate as jasmine.Spy).calls.reset();

            // When current player is playerTwo
            component.player = playerTwo;
            component.testCheckAndUpdatePlayers(playerOne, playerTwo, 'player2', currentTime);
            expect(component.testHandlePlayerUpdate).toHaveBeenCalledWith(playerTwo, playerOne, 'player2', currentTime);
        });
    });

    describe('Logout Functionality', () => {
        it('should handle logout correctly', () => {
            component.isLoggedIn = true;
            component.showLobby = true;
            component.showLogin = false;

            component.onLogout();

            expect(mockAuthService.logout).toHaveBeenCalled();
            expect(component.isLoggedIn).toBeFalse();
            expect(component.showLobby).toBeFalse();
            expect(component.showLogin).toBeTrue();
        });
    });

    describe('Login/Registration Events', () => {
        it('should handle successful login/registration', () => {
            component.showLogin = true;
            component.showLobby = false;

            component.onLoginOrRegEvent(true);

            expect(component.showLogin).toBeFalse();
            expect(component.showLobby).toBeTrue();
        });

        it('should not change state on failed login/registration', () => {
            component.showLogin = true;
            component.showLobby = false;

            component.onLoginOrRegEvent(false);

            expect(component.showLogin).toBeTrue();
            expect(component.showLobby).toBeFalse();
        });
    });

    describe('Winning Condition Handling', () => {
        beforeEach(() => {
            component.player = { ...mockPlayer };
            component.playerOne = { ...mockPlayer };
            component.playerTwo = { ...mockOpponent };
        });

        it('should trigger winner update when player reaches winning score', () => {
            const winningPlayer = { ...mockPlayer, score: GAME.WINNING_SCORE };
            const losingPlayer = { ...mockOpponent, score: 5 };
            spyOn(component, 'testUpdateWinner');

            component.testHandlePlayerUpdate(winningPlayer, losingPlayer, 'player1', Date.now());

            expect(component.testUpdateWinner).toHaveBeenCalledWith(winningPlayer);
        });

        it('should trigger winner update when opponent reaches winning score', () => {
            const losingPlayer = { ...mockPlayer, score: 5 };
            const winningPlayer = { ...mockOpponent, score: GAME.WINNING_SCORE };
            spyOn(component, 'testUpdateWinner');

            component.testHandlePlayerUpdate(losingPlayer, winningPlayer, 'player1', Date.now());

            expect(component.testUpdateWinner).toHaveBeenCalledWith(winningPlayer);
        });
    });
});