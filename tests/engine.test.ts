import { expect, test, describe } from 'vitest';
import { GameEngine } from '../src/engine';
import { EntityType } from '../src/types';

describe('GameEngine Logic', () => {
    const mockState = {
        player: { pos: { x: 0, y: 0 }, health: 100, energy: 1, inventory: [] },
        world: { gridSize: 5, isGateOpen: false, entities: [] }
    };

    test('should prevent moving when energy is 0', () => {
        const engine = new GameEngine(mockState as any);
        engine.movePlayer(1, 0); // Uses the 1 energy
        expect(() => engine.movePlayer(1, 1)).toThrow('No energy left!');
    });

    test('should unlock gate when key is picked up', () => {
        const stateWithKey = { ...mockState, world: { ...mockState.world, entities: [
            { id: 'k1', type: EntityType.KEY, pos: { x: 1, y: 0 }, collected: false }
        ]}};
        const engine = new GameEngine(stateWithKey as any);
        engine.movePlayer(1, 0);
        expect(engine.getState().world.isGateOpen).toBe(true);
    });
});