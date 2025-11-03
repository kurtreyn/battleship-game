import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { BoardComponent } from './board.component';
import { GameService } from 'src/app/services/game.service';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
import { IPlayer, ICell, IBoard } from 'src/app/models/game';
import { SHIP_NAME, SHIP_LEN } from 'src/app/enums/enums';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let mockGameService: jasmine.SpyObj<GameService>;
  let mockDataService: jasmine.SpyObj<DataService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockBoardService: jasmine.SpyObj<BoardService>;

  const mockCells: ICell[] = [
    {
      x: 0, y: 0, row_label: 'A', coordinates: 'a1',
      occupied: false, hit: false, miss: false, highlighted: false
    },
    {
      x: 1, y: 0, row_label: 'A', coordinates: 'a2',
      occupied: false, hit: false, miss: false, highlighted: false
    },
    {
      x: 2, y: 0, row_label: 'A', coordinates: 'a3',
      occupied: false, hit: false, miss: false, highlighted: false
    }
  ];

  const mockBoard: IBoard = {
    cells: mockCells,
    rows: {
      'a': mockCells
    }
  };

  const mockPlayer: IPlayer = {
    id: 'player1',
    playerId: 'auth-player1',
    name: 'Player 1',
    email: 'player1@test.com',
    isReady: false,
    score: 0,
    readyToEnterGame: false,
    finishedSetup: false,
    isTurn: true,
    isWinner: false,
    isActive: true,
    session: 'test-session',
    shipLocations: {
      carrier: ['a1', 'a2', 'a3', 'a4', 'a5'],
      battleship: ['b1', 'b2', 'b3', 'b4'],
      cruiser: ['c1', 'c2', 'c3'],
      submarine: ['d1', 'd2', 'd3'],
      destroyer: ['e1', 'e2']
    },
    shipArray: ['a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'd1', 'd2', 'd3', 'e1', 'e2'],
    board: mockBoard,
    boardSetup: {
      isSettingUp: false,
      carrierSet: true,
      battleshipSet: true,
      cruiserSet: true,
      submarineSet: true,
      destroyerSet: true,
      settingShip: '',
      isFinishedSettingUp: true
    },
    lastUpdated: Date.now()
  };

  const mockOpponent: IPlayer = {
    ...mockPlayer,
    id: 'player2',
    playerId: 'auth-player2',
    name: 'Player 2',
    email: 'player2@test.com',
    isTurn: false
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
      declarations: [BoardComponent],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: BoardService, useValue: boardServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;

    mockGameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    mockDataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockBoardService = TestBed.inject(BoardService) as jasmine.SpyObj<BoardService>;

    // Setup default mock returns
    mockAuthService.getCurrentUser.and.returnValue(of(null));
    mockDataService.getAllPlayers.and.returnValue(of([]));
    mockDataService.getRequests.and.returnValue(of([]));
    mockDataService.updatePlayer.and.returnValue(of(null));
    mockDataService.sendUpdate.and.returnValue(of(null));
    mockBoardService.createBoard.and.returnValue(mockBoard);
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
    mockBoardService.getShipLength.and.returnValue(5);
    mockGameService.getPlayer.and.returnValue(mockPlayer);

    // Initialize component with mock data
    component.player = { ...mockPlayer };
    component.opponent = { ...mockOpponent };
    component.sessionId = 'test-session';
    component.requestId = 'test-request';
    component.gameStarted = true;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Board Display', () => {
    it('should return correct row cells for player', () => {
      const cells = component.getRowCells('A');
      expect(cells).toEqual(mockCells);
    });

    it('should return empty array when player board is not initialized', () => {
      component.player.board = undefined;
      const cells = component.getRowCells('A');
      expect(cells).toEqual([]);
    });

    it('should return correct row cells for opponent', () => {
      component.opponent.board = mockBoard;
      const cells = component.getOpponentRowCells('A');
      expect(cells).toEqual(mockCells);
    });

    it('should return empty array when opponent board is not initialized', () => {
      component.opponent.board = undefined;
      const cells = component.getOpponentRowCells('A');
      expect(cells).toEqual([]);
    });
  });

  describe('Ship Placement', () => {
    beforeEach(() => {
      component.player.boardSetup!.isSettingUp = true;
      component.player.boardSetup!.settingShip = SHIP_NAME.CARRIER;
      component.currentShipLength = SHIP_LEN.CARRIER;
    });

    it('should start dragging on mouse down when in setup mode', () => {
      const cell = mockCells[0];

      component.onMouseDown(cell);

      expect(component.isDragging).toBeTrue();
      expect(component.dragStartCell).toBe(cell);
    });

    it('should not start dragging on occupied cell', () => {
      const occupiedCell = { ...mockCells[0], occupied: true };

      component.onMouseDown(occupiedCell);

      expect(component.isDragging).toBeFalse();
      expect(component.dragStartCell).toBeNull();
    });

    it('should end dragging and place ship on mouse up', () => {
      const startCell = mockCells[0];
      const endCell = mockCells[2];

      component.isDragging = true;
      component.dragStartCell = startCell;

      spyOn(component as any, '_placeShip');

      component.onMouseUp(endCell);

      expect(component.isDragging).toBeFalse();
      expect(component.dragEndCell).toBe(endCell);
      expect((component as any)._placeShip).toHaveBeenCalled();
    });

    it('should check if ship has been set correctly', () => {
      component.player.boardSetup!.carrierSet = true;
      component.player.boardSetup!.battleshipSet = false;

      expect(component.hasShipBeenSet(SHIP_NAME.CARRIER)).toBeTrue();
      expect(component.hasShipBeenSet(SHIP_NAME.BATTLESHIP)).toBeFalse();
      expect(component.hasShipBeenSet('unknown')).toBeFalse();
    });
  });

  describe('Board Setup Toggle', () => {
    it('should toggle setup mode when not finished setting up', () => {
      component.player.boardSetup!.isFinishedSettingUp = false;
      component.player.boardSetup!.isSettingUp = false;
      component.shipsToSet = [SHIP_NAME.CARRIER];

      component.toggleBoardSetup();

      expect(component.player.boardSetup!.isSettingUp).toBeTrue();
      expect(component.player.boardSetup!.settingShip).toBe(SHIP_NAME.CARRIER);
      expect(mockBoardService.getShipLength).toHaveBeenCalledWith(SHIP_NAME.CARRIER);
    });

    it('should set player as ready when finished setting up', () => {
      component.player.boardSetup!.isFinishedSettingUp = true;
      spyOn(component as any, '_setPlayerAsReady');

      component.toggleBoardSetup();

      expect((component as any)._setPlayerAsReady).toHaveBeenCalled();
    });
  });

  describe('Player Ready State', () => {
    beforeEach(() => {
      component.player.boardSetup!.isFinishedSettingUp = true;
      component.player.shipLocations = {
        carrier: ['a1', 'a2'],
        battleship: ['b1', 'b2'],
        cruiser: [],
        submarine: [],
        destroyer: []
      };
    });

    it('should set player as ready with correct data', () => {
      (component as any)._setPlayerAsReady();

      expect(mockDataService.updatePlayer).toHaveBeenCalled();
      expect(mockGameService.updatePlayer).toHaveBeenCalled();
      expect(mockDataService.sendUpdate).toHaveBeenCalled();

      const updateCall = mockGameService.updatePlayer.calls.mostRecent().args[0];
      expect(updateCall.finishedSetup).toBeTrue();
      expect(updateCall.isReady).toBeTrue();
      expect(updateCall.session).toBe('test-session');
      expect(updateCall.shipArray).toEqual(['a1', 'a2', 'b1', 'b2']);
      expect(updateCall.lastUpdated).toBeDefined();
    });

    it('should not set player as ready if not finished setting up', () => {
      component.player.boardSetup!.isFinishedSettingUp = false;

      (component as any)._setPlayerAsReady();

      expect(mockDataService.updatePlayer).not.toHaveBeenCalled();
      expect(mockGameService.updatePlayer).not.toHaveBeenCalled();
    });
  });

  describe('Cell Click Interactions', () => {
    beforeEach(() => {
      component.player.isTurn = true;
      component.gameStarted = true;
      component.opponent.shipArray = ['a1', 'a2', 'a3'];
      component.opponent.board = mockBoard;
    });

    it('should handle hit on opponent ship', () => {
      const hitCell = { ...mockCells[0], coordinates: 'a1' };
      mockGameService.getPlayer.and.returnValue(component.player);

      component.onCellClick(hitCell);

      expect(hitCell.hit).toBeTrue();
      expect(mockDataService.updatePlayer).toHaveBeenCalledTimes(2); // Player and opponent
      expect(mockGameService.updatePlayerAndOpponent).toHaveBeenCalled();

      const playerUpdate = mockDataService.updatePlayer.calls.first().args[0];
      expect(playerUpdate.score).toBe(1);
      expect(playerUpdate.isTurn).toBeFalse();
    });

    it('should handle miss on opponent board', () => {
      const missCell = { ...mockCells[0], coordinates: 'x1' }; // Not in shipArray
      mockGameService.getPlayer.and.returnValue(component.player);

      component.onCellClick(missCell);

      expect(missCell.miss).toBeTrue();
      expect(mockDataService.updatePlayer).toHaveBeenCalledTimes(2); // Player and opponent
      expect(mockGameService.updatePlayerAndOpponent).toHaveBeenCalled();

      const playerUpdate = mockDataService.updatePlayer.calls.first().args[0];
      expect(playerUpdate.score).toBe(0); // No score increase for miss
      expect(playerUpdate.isTurn).toBeFalse();
    });

    it('should not process click when not player turn', () => {
      component.player.isTurn = false;
      const cell = mockCells[0];

      component.onCellClick(cell);

      expect(mockDataService.updatePlayer).not.toHaveBeenCalled();
    });

    it('should not process click when in setup mode', () => {
      component.player.boardSetup!.isSettingUp = true;
      const cell = mockCells[0];

      component.onCellClick(cell);

      expect(mockDataService.updatePlayer).not.toHaveBeenCalled();
    });
  });

  describe('Board Reset', () => {
    it('should reset board completely', () => {
      // Set up board with some state
      component.player.board!.cells.forEach(cell => {
        cell.occupied = true;
        cell.hit = true;
        cell.miss = true;
        cell.highlighted = true;
      });

      component.resetBoard();

      // Check all cells are reset
      component.player.board!.cells.forEach(cell => {
        expect(cell.occupied).toBeFalse();
        expect(cell.hit).toBeFalse();
        expect(cell.miss).toBeFalse();
        expect(cell.highlighted).toBeFalse();
      });

      // Check board setup is reset
      expect(component.player.boardSetup!.isSettingUp).toBeFalse();
      expect(component.player.boardSetup!.carrierSet).toBeFalse();
      expect(component.player.boardSetup!.isFinishedSettingUp).toBeFalse();

      // Check ship locations are reset
      expect(component.player.shipLocations!.carrier).toEqual([]);
      expect(component.player.shipLocations!.battleship).toEqual([]);
    });
  });

  describe('Touch Events', () => {
    let mockTouchEvent: jasmine.SpyObj<TouchEvent>;
    let mockTouch: jasmine.SpyObj<Touch>;

    beforeEach(() => {
      mockTouch = jasmine.createSpyObj('Touch', [], {
        clientX: 100,
        clientY: 100
      });

      mockTouchEvent = jasmine.createSpyObj('TouchEvent', ['preventDefault'], {
        touches: [mockTouch],
        changedTouches: [mockTouch]
      });

      spyOn(document, 'elementFromPoint').and.returnValue(document.createElement('div'));
    });

    it('should handle touch start', () => {
      const cell = mockCells[0];
      component.player.boardSetup!.isSettingUp = true;

      component.onTouchStart(mockTouchEvent, cell);

      expect(mockTouchEvent.preventDefault).toHaveBeenCalled();
      expect(component.isDragging).toBeTrue();
      expect(component.dragStartCell).toBe(cell);
    });

    it('should handle touch end', () => {
      const cell = mockCells[0];
      (component as any)._touchStartCell = cell;
      component.isDragging = true;

      const mockElement = document.createElement('div');
      mockElement.classList.add('grid-cell');
      mockElement.setAttribute('data-x', '0');
      mockElement.setAttribute('data-y', '0');
      spyOn(mockElement, 'closest').and.returnValue(mockElement);
      spyOn(document, 'elementFromPoint').and.returnValue(mockElement);
      spyOn(component as any, '_placeShip');

      component.onTouchEnd(mockTouchEvent);

      expect(mockTouchEvent.preventDefault).toHaveBeenCalled();
      expect(component.isDragging).toBeFalse();
      expect((component as any)._placeShip).toHaveBeenCalled();
    });
  });

  describe('Private Helper Methods', () => {
    it('should trigger update correctly', () => {
      component.requestId = 'test-request';

      (component as any)._triggerUpdate();

      expect(mockDataService.sendUpdate).toHaveBeenCalledWith(
        'test-request', true, true, true, jasmine.any(Number), false
      );
    });

    it('should get cell info correctly', () => {
      const cell = mockCells[0];

      const cellInfo = (component as any)._getCellInfo(cell);

      expect(cellInfo.x).toBe(cell.x);
      expect(cellInfo.y).toBe(cell.y);
      expect(cellInfo.coordinates).toBe(cell.coordinates);
      expect(cellInfo.row_label).toBe(cell.row_label);
    });
  });
});
