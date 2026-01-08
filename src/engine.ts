import { GameState, Position, EntityType, GameEntity } from './types.js';

export class GameEngine {
    private state: GameState;
    private initialState: string;

    constructor(initialState: GameState) {
        // Deep clone to ensure the starting point is preserved for resets
        this.state = JSON.parse(JSON.stringify(initialState));
        this.initialState = JSON.stringify(initialState);
    }

    public movePlayer(newX: number, newY: number): void {
        // Requirement: Edge Case Handling (Boundary Check)
        if (newX < 0 || newX >= this.state.world.gridSize || newY < 0 || newY >= this.state.world.gridSize) {
            console.warn("Invalid move: Out of bounds.");
            return;
        }

        this.state.player.pos = { x: newX, y: newY };
        this.checkCollisions();
    }

    private checkCollisions(): void {
        const { x, y } = this.state.player.pos;
        const item = this.state.world.entities.find(e => e.pos.x === x && e.pos.y === y && !e.collected);

        if (item) {
            item.collected = true;
            this.state.player.inventory.push(item.type);
            
            // Interaction logic: Key opens the gate
            if (item.type === EntityType.KEY) {
                this.state.world.isGateOpen = true;
            }
        }
    }

    // Requirement: State Persistence (Serialization)
    public saveState(): string {
        return JSON.stringify(this.state);
    }

    public loadState(json: string): void {
        try {
            this.state = JSON.parse(json);
        } catch (e) {
            console.error("Failed to load: Invalid state data.");
        }
    }

    public reset(): void {
        this.state = JSON.parse(this.initialState);
    }

    public getState(): GameState {
        return this.state;
    }
}