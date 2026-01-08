import { GameEngine } from './engine.js';
import { EntityType, GameState, Position } from './types.js';
import * as readline from 'readline';
import { writeFileSync, readFileSync } from 'fs';
import { printIntro, printGrid } from './ui.js';

// helper to find a free spot on  the grid
function randomPos(exclude: Position[] = []): Position {
    // Helper to check if a coordinate is already taken
    const isOccupied = (x: number, y: number) => {
        if (x === 0 && y === 0) return true; // player start
        if (x === 4 && y === 4) return true; // gate
        return exclude.some(p => p.x === x && p.y === y);
    };

    let x: number, y: number;
    do {
        x = Math.floor(Math.random() * 5);
        y = Math.floor(Math.random() * 5);
    } while (isOccupied(x, y)); // Check against our helper function

    return { x, y };
}

// Generate random positions
const keyPos = randomPos();
const potionPos = randomPos([keyPos]); // Don't spawn potion on key

// initial game setup
const STARTING_STATE: GameState = {
    player: { pos: { x: 0, y: 0 }, health: 100, energy: 15, inventory: [] },
    world: {
        gridSize: 5,
        isGateOpen: false,
        entities: [
            { id: "k1", type: EntityType.KEY, pos: keyPos, collected: false },
            { id: "p1", type: EntityType.POTION, pos: potionPos, collected: false },
            { id: "gate", type: EntityType.GATE, pos: { x: 4, y: 4 }, collected: false }
        ]
    }
};

const engine = new GameEngine(STARTING_STATE);

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// === CLEAN MINIMAL STATUS EVERY TURN ===
function printMinimalStatus() {
    const state = engine.getState();
    console.log(`\nPosition: (${state.player.pos.x}, ${state.player.pos.y})`);
    console.log(`❤️  Health: ${state.player.health}  |  ⚡ Energy: ${state.player.energy}`);
    console.log(`🎒 Inventory: ${state.player.inventory.join(', ') || 'empty'}`);
    console.log(`🚪 Gate: ${state.world.isGateOpen ? 'Unlocked ◉' : 'Locked ◈'}`);
    console.log('\nMove: U/D/L/R  |  Other: use potion, save, load, reset, quit');

    // Calling the imported grid printer
    printGrid(state);
}


// === MAIN GAME LOOP ===
async function askMove() {
    printMinimalStatus();

    rl.question('\n> Your move: ', (input) => {
        const cmd = input.trim().toLowerCase();

        // 1. Handle Meta Commands
        if (cmd === 'quit') {
            console.log("\nThanks for playing The Arcane Vault! 👋\n");
            rl.close();
            return; // Stop the loop
        }

        if (cmd === 'reset') {
            engine.reset();
            console.log('\n🔄 Game state reset to start!');
            return askMove(); // Restart loop
        }

        if (cmd === 'save') {
            try {
                writeFileSync('save.json', engine.saveState(), 'utf8'); 
                console.log('\n💾 Game saved successfully!');
            } catch (error) {
                console.log('\n❌ Failed to save.');
            }
            return askMove();
        }

        if (cmd === 'load') {
            try {
                const data = readFileSync('save.json', 'utf8');
                engine.loadState(data);
                console.log('\n📂 Game loaded successfully!');
            } catch (e: any) {
                
                console.log(`\n❌ ${e.message || 'No save file found.'}`);
            }
            return askMove();
        }
        
        // 2. Handle Gameplay Commands
        if (cmd === 'use potion') {
            try {
                const msg = engine.useItem(EntityType.POTION);
                console.log(`\n🧪 ${msg}`);
            } catch (e: any) {
                console.log(`\n❌ ${e.message}`);
            }
            return askMove();
        }

        // 3. Handle Movement
        const moves: { [key: string]: { dx: number; dy: number } } = {
            u: { dx: 0, dy: -1 },
            d: { dx: 0, dy: 1 },
            l: { dx: -1, dy: 0 },
            r: { dx: 1, dy: 0 }
        };

        if (cmd in moves) {
            const { dx, dy } = moves[cmd];
            const state = engine.getState();
            const newX = state.player.pos.x + dx;
            const newY = state.player.pos.y + dy;

            try {
                const result = engine.movePlayer(newX, newY);
                console.log(`\n✨ ${result.message}`);
                
                if (result.won) {
                    printMinimalStatus();
                    console.log("\n🎉 VICTORY! You escaped the Vault! 🏆\n");
                    rl.close();
                    return;
                }
            } catch (e: any) {
                console.log(`\n❌ ${e.message}`);
            }
            return askMove();
        } else {
            console.log("\n❓ Invalid command. Use: U/D/L/R, 'use potion', 'save', 'load', or 'reset'.");
            askMove();
        }

        askMove();
    });
}

// === START THE GAME ===
printIntro(engine.getState());
askMove();