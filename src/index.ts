import { GameEngine } from './engine.js';
import { EntityType, GameState } from './types.js';
import * as readline from 'readline';

const STARTING_STATE: GameState = {
    player: { pos: { x: 0, y: 0 }, health: 100, inventory: [] },
    world: {
        gridSize: 5,
        isGateOpen: false,
        entities: [
            { id: "k1", type: EntityType.KEY, pos: { x: 1, y: 1 }, collected: false },
            { id: "p1", type: EntityType.POTION, pos: { x: 3, y: 2 }, collected: false },
            { id: "gate", type: EntityType.GATE, pos: { x: 4, y: 4 }, collected: false }
        ]
    }
};

const engine = new GameEngine(STARTING_STATE);

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function printStatus() {
    const state = engine.getState();
    console.log(`\nPosition: (${state.player.pos.x}, ${state.player.pos.y})`);
    console.log(`Health: ${state.player.health} | Inventory: ${state.player.inventory.join(", ") || "empty"}`);
    console.log(`Gate Open: ${state.world.isGateOpen ? "Yes" : "No"}`);
}

function askMove() {
    printStatus();
    rl.question('\nEnter move (e.g., 2 3) or "quit" to exit: ', (input) => {
        if (input.toLowerCase() === 'quit') {
            rl.close();
            return;
        }

        if (input.toLowerCase() === 'use potion' && engine.getState().player.inventory.includes(EntityType.POTION)) {
            engine.useItem(EntityType.POTION);
            console.log("Potion used! Health +30");
            askMove();
            return;
        }

        const parts = input.trim().split(' ');
        if (parts.length !== 2) {
            console.log("Please enter two numbers: x y");
            askMove();
            return;
        }

        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);

        if (isNaN(x) || isNaN(y)) {
            console.log("Invalid numbers!");
            askMove();
            return;
        }

        engine.movePlayer(x, y);
        askMove(); // Ask again for next move
    });
}

console.log("=== The Arcane Vault ===");
console.log("Goal: Collect the KEY to unlock the gate, then reach (4,4) to escape.\n");
console.log("Start at (0,0). Key at (1,1). Potion at (3,2). Gate at (4,4).\n");

askMove();