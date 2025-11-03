import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { IPlayer } from '../models/game';

describe('GameService', () => {
  let service: GameService;

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
    ...mockPlayer,
    id: 'player2',
    playerId: 'auth-player2',
    name: 'Player 2',
    email: 'player2@test.com'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = service.generateId();
      const id2 = service.generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('Player Management', () => {
    it('should set player and emit through observable', (done) => {
      service.player$.subscribe(player => {
        if (player) {
          expect(player).toEqual(mockPlayer);
          done();
        }
      });

      service.setPlayer(mockPlayer);
    });

    it('should update player and emit through observable', (done) => {
      const updatedPlayer = { ...mockPlayer, score: 5 };

      service.player$.subscribe(player => {
        if (player && player.score === 5) {
          expect(player).toEqual(updatedPlayer);
          done();
        }
      });

      service.updatePlayer(updatedPlayer);
    });

    it('should get current player value', () => {
      service.setPlayer(mockPlayer);
      const currentPlayer = service.getPlayer();
      expect(currentPlayer).toEqual(mockPlayer);
    });

    it('should return null when no player is set', () => {
      const currentPlayer = service.getPlayer();
      expect(currentPlayer).toBeNull();
    });
  });

  describe('Opponent Management', () => {
    it('should update opponent and emit through observable', (done) => {
      service.opponent$.subscribe(opponent => {
        if (opponent) {
          expect(opponent).toEqual(mockOpponent);
          done();
        }
      });

      service.updateOpponent(mockOpponent);
    });

    it('should get current opponent value', () => {
      service.updateOpponent(mockOpponent);
      const currentOpponent = service.getOpponent();
      expect(currentOpponent).toEqual(mockOpponent);
    });

    it('should return null when no opponent is set', () => {
      const currentOpponent = service.getOpponent();
      expect(currentOpponent).toBeNull();
    });
  });

  describe('Player and Opponent Updates', () => {
    it('should update both player and opponent simultaneously', (done) => {
      let playerUpdated = false;
      let opponentUpdated = false;

      service.player$.subscribe(player => {
        if (player) {
          expect(player).toEqual(mockPlayer);
          playerUpdated = true;
          checkCompletion();
        }
      });

      service.opponent$.subscribe(opponent => {
        if (opponent) {
          expect(opponent).toEqual(mockOpponent);
          opponentUpdated = true;
          checkCompletion();
        }
      });

      function checkCompletion() {
        if (playerUpdated && opponentUpdated) {
          done();
        }
      }

      service.updatePlayerAndOpponent(mockPlayer, mockOpponent);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors when updating player', () => {
      spyOn(console, 'error');

      // Force an error by passing invalid data
      const invalidPlayer = null as any;

      expect(() => {
        service.updatePlayer(invalidPlayer);
      }).not.toThrow();

      // The service should catch and log the error
      expect(console.error).toHaveBeenCalledWith('Error updating player:', jasmine.any(TypeError));
    });

    it('should handle errors when updating opponent', () => {
      spyOn(console, 'error');

      // Force an error by passing invalid data
      const invalidOpponent = null as any;

      expect(() => {
        service.updateOpponent(invalidOpponent);
      }).not.toThrow();

      // The service should catch and log the error
      expect(console.error).toHaveBeenCalledWith('Error updating opponent:');
    });

    it('should handle errors when updating both player and opponent', () => {
      spyOn(console, 'error');

      // Force an error by passing invalid data
      const invalidPlayer = null as any;
      const invalidOpponent = null as any;

      expect(() => {
        service.updatePlayerAndOpponent(invalidPlayer, invalidOpponent);
      }).not.toThrow();

      // The service should catch and log the error
      expect(console.error).toHaveBeenCalledWith('Error updating player and opponent:', jasmine.any(TypeError));
    });
  });

  describe('Observable Streams', () => {
    it('should provide distinct player observable', () => {
      let emissionCount = 0;

      service.player$.subscribe(() => {
        emissionCount++;
      });

      // Set same player twice
      service.setPlayer(mockPlayer);
      service.setPlayer(mockPlayer);

      // Should only emit twice (initial null + first set)
      expect(emissionCount).toBe(2);
    });

    it('should provide distinct opponent observable', () => {
      let emissionCount = 0;

      service.opponent$.subscribe(() => {
        emissionCount++;
      });

      // Update same opponent twice
      service.updateOpponent(mockOpponent);
      service.updateOpponent(mockOpponent);

      // Should only emit twice (initial null + first update)
      expect(emissionCount).toBe(2);
    });
  });

  describe('State Persistence', () => {
    it('should maintain player state across multiple operations', () => {
      // Set initial player
      service.setPlayer(mockPlayer);
      expect(service.getPlayer()).toEqual(mockPlayer);

      // Update player
      const updatedPlayer = { ...mockPlayer, score: 10 };
      service.updatePlayer(updatedPlayer);
      expect(service.getPlayer()).toEqual(updatedPlayer);

      // Set opponent (should not affect player)
      service.updateOpponent(mockOpponent);
      expect(service.getPlayer()).toEqual(updatedPlayer);
      expect(service.getOpponent()).toEqual(mockOpponent);
    });
  });
});
