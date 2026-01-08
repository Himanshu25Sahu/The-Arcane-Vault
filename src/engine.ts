import { GameState, Position, EntityType, GameEntity } from './types.js';
import { rl } from './index.js';

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

        // First: Check for normal collectible items (KEY and POTION only)
        const collectible = this.state.world.entities.find(
            e => e.pos.x === x && 
                e.pos.y === y && 
                !e.collected && 
                (e.type === EntityType.KEY || e.type === EntityType.POTION)
        );

        if (collectible) {
            this.pickupItem(collectible.id);
        }

        // Second: Check for gate interaction
        const gate = this.state.world.entities.find(
            e => e.type === EntityType.GATE && 
                e.pos.x === x && 
                e.pos.y === y
        );

        if (gate) {
            this.interactWithEnvironment(gate.id);
        }
    }

    public interactWithEnvironment(objId: string): void {
        const obj = this.state.world.entities.find(e => e.id === objId);
        if (!obj) throw new Error('Environment object not found');

        if (obj.type === EntityType.GATE) {
            if (!this.state.world.isGateOpen) {
                throw new Error('The Magic Gate is locked. You need the Crystal Key.');
            }

            console.log("\n🎉 The gate swings open! You step through and escape the Arcane Vault! 🎉");
            console.log("           VICTORY! You win! 🏆\n");
            rl.close();  // This will stop the game
            process.exit(0);
        }

        // Extensible for future objects like switches, doors, NPCs, etc.
    }

    // Requirement: Item Interaction
    public pickupItem(itemId: string): void {
        const item = this.state.world.entities.find(e => e.id === itemId && !e.collected);
        if (!item) throw new Error('Item not found or already collected');

        if (Math.abs(item.pos.x - this.state.player.pos.x) > 0 || Math.abs(item.pos.y - this.state.player.pos.y) > 0) {
            throw new Error('Not close enough to item');
        }

        item.collected = true;
        this.state.player.inventory.push(item.type);

        console.log(`\nYou picked up the ${item.type}!`);

        if (item.type === EntityType.KEY) {
            this.state.world.isGateOpen = true;
            console.log("The Magic Gate unlocks with a click...");
        }
        // Rationale: Explicit function for modularity; allows calling without move in future extensions
    }

    public useItem(itemType: EntityType): void {
        const index = this.state.player.inventory.indexOf(itemType);
        if (index === -1) throw new Error('Item not in inventory');

        // Remove from inventory after use
        this.state.player.inventory.splice(index, 1);

        if (itemType === EntityType.POTION) {
            this.state.player.health = Math.min(100, this.state.player.health + 30);
        }
        // Rationale: Consumable items like potion; extensible to more effects (e.g., key not consumable)
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