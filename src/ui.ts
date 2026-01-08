import { GameState, EntityType } from './types.js';

export function printIntro(state: GameState) {
    console.clear();
    console.log("=".repeat(50));
    console.log("      🏰 THE ARCANE VAULT 🏰");
    console.log("=".repeat(50));
    console.log("Goal: Find the Crystal Key (K), then escape through the Gate at (4,4).\n");
    printGrid(state);
}

export function printGrid(state: GameState) {
    const grid: string[][] = Array(state.world.gridSize).fill(null)
        .map(() => Array(state.world.gridSize).fill('·'));

    grid[state.player.pos.y][state.player.pos.x] = 'P';

    state.world.entities.forEach(e => {
        if (!e.collected && e.type !== EntityType.GATE) {
            grid[e.pos.y][e.pos.x] = e.type === EntityType.KEY ? 'K' : 'O';
        }
    });

    const gate = state.world.entities.find(e => e.type === EntityType.GATE);
    if (gate) grid[gate.pos.y][gate.pos.x] = state.world.isGateOpen ? '◉' : '◈';

    console.log('\n     0 1 2 3 4');
    grid.forEach((row, i) => console.log(` ${i} | ${row.join(' ')} |`));
}