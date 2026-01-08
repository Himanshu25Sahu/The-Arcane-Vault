import { GameEngine } from './engine.js';
import { EntityType, GameState } from './types.js';

const STARTING_STATE: GameState = {
    player: { pos: { x: 0, y: 0 }, health: 100, inventory: [] },
    world: {
        gridSize: 5,
        isGateOpen: false,
        entities: [
            { id: "k1", type: EntityType.KEY, pos: { x: 1, y: 1 }, collected: false },
            { id: "p1", type: EntityType.POTION, pos: { x: 2, y: 2 }, collected: false }
        ]
    }
};

const engine = new GameEngine(STARTING_STATE);

console.log("--- Simulation Started ---");
engine.movePlayer(1, 1); // Collect Key
console.log("Inventory:", engine.getState().player.inventory);
console.log("Gate Open?", engine.getState().world.isGateOpen);

// Test Persistence
const save = engine.saveState();
engine.reset();
console.log("Pos after reset:", engine.getState().player.pos);
engine.loadState(save);
console.log("Pos after load:", engine.getState().player.pos);