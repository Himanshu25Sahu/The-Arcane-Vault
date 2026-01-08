import { GameEngine } from './engine.js';
import { EntityType, GameState, Position } from './types.js';
import * as readline from 'readline';
const fsPromise = import('fs');

// Importing UI components to keep the main file clean
import { printIntro, printGrid } from './ui.js';

// === RANDOM POSITION HELPER ===
function randomPos(exclude: Position[] = []): Position {
    const excluded = new Set<string>();
    exclude.forEach(p => excluded.add(`${p.x},${p.y}`));
    
    // Always exclude player start and gate
    excluded.add('0,0');
    excluded.add('4,4');

    let x: number, y: number;
    do {
        x = Math.floor(Math.random() * 5);
        y = Math.floor(Math.random() * 5);
    } while (excluded.has(`${x},${y}`));

    return { x, y };
}

// Generate random positions
const keyPos = randomPos();
const potionPos = randomPos([keyPos]); // Don't spawn potion on key

// === STARTING STATE WITH RANDOM POSITIONS ===
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

        if (cmd === 'quit') {
            console.log("\nThanks for playing The Arcane Vault! 👋\n");
            rl.close();
            return;
        }

        if (cmd === 'use potion') {
            try {
                engine.useItem(EntityType.POTION);
            } catch (e: any) {
                console.log(`❌ ${e.message}`);
            }
            askMove();
            return;
        }

        if (cmd === 'save') {
            fsPromise.then(fs => {
                fs.writeFileSync('save.json', engine.saveState(), 'utf8');
                console.log('💾 Game saved to save.json');
            }).catch(() => {
                console.log('❌ Failed to save.');
            });
            askMove();
            return;
        }

        if (cmd === 'load') {
            fsPromise.then(fs => {
                try {
                    const data = fs.readFileSync('save.json', 'utf8');
                    engine.loadState(data);
                    console.log('📂 Game loaded successfully!');
                } catch (e) {
                    console.log('❌ No save file found or failed to load.');
                }
            }).catch(() => {
                console.log('❌ Failed to access file system.');
            });
            askMove();
            return;
        }

        if (cmd === 'reset') {
            engine.reset();
            console.log('🔄 Reset!');
            askMove();
            return;
        }

        // Directional moves
        const moves: { [key: string]: { dx: number; dy: number } } = {
            u: { dx: 0, dy: -1 },
            d: { dx: 0, dy: 1 },
            l: { dx: -1, dy: 0 },
            r: { dx: 1, dy: 0 }
        };

        if (cmd in moves) {
            const { dx, dy } = moves[cmd];
            const newX = engine.getState().player.pos.x + dx;
            const newY = engine.getState().player.pos.y + dy;
            try {
                engine.movePlayer(newX, newY);
            } catch (e: any) {
                console.log(`❌ ${e.message}`);
            }
        } else {
            console.log("❓ Invalid command. Use: U/D/L/R or full commands.");
        }

        askMove();
    });
}

// === START THE GAME ===
printIntro(engine.getState());
askMove();