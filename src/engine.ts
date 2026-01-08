import { GameState, Position, EntityType } from './types.js';



export class GameEngine {
    private state: GameState;
    private initialState: string;

    constructor(initialState: GameState) {
        this.state = JSON.parse(JSON.stringify(initialState));
        this.initialState = JSON.stringify(initialState);
    }

    public movePlayer(newX: number, newY: number): { message: string, won: boolean } {
        const currentX = this.state.player.pos.x;
        const currentY = this.state.player.pos.y;

        const dx = Math.abs(newX - currentX);
        const dy = Math.abs(newY - currentY);
        
        if (dx + dy !== 1) throw new Error('Invalid move: Not adjacent.');
        if (this.state.player.energy <= 0) throw new Error('No energy left!');
        if (newX < 0 || newX >= this.state.world.gridSize || newY < 0 || newY >= this.state.world.gridSize) {
            throw new Error('Out of bounds!');
        }

        this.state.player.pos = { x: newX, y: newY };
        this.state.player.energy -= 1;
        
        // check if player stepped on an item or the exit
        return this.checkCollisions();
    }

    private checkCollisions(): { message: string, won: boolean } {
        const { x, y } = this.state.player.pos;
        let message = `Moved to (${x}, ${y})`;
        let won = false;

        const entity = this.state.world.entities.find(e => e.pos.x === x && e.pos.y === y && !e.collected);

        if (entity) {
            if (entity.type === EntityType.GATE) {
                if (this.state.world.isGateOpen) won = true;
                else throw new Error('The Gate is locked. Need the Key.');
            } else {
                this.pickupItem(entity.id);
                message += ` | Picked up ${entity.type}!`;
                if (entity.type === EntityType.KEY) message += " Gate is now open.";
            }
        }
        return { message, won };
    }

    public pickupItem(itemId: string): void {
        const item = this.state.world.entities.find(e => e.id === itemId);
        if (item) {
            item.collected = true;
            this.state.player.inventory.push(item.type);
            if (item.type === EntityType.KEY) this.state.world.isGateOpen = true;
        }
    }

    public useItem(itemType: EntityType): string {
        const index = this.state.player.inventory.indexOf(itemType);
        if (index === -1) throw new Error('Item not in inventory');

        this.state.player.inventory.splice(index, 1);
        if (itemType === EntityType.POTION) {
            this.state.player.health = Math.min(100, this.state.player.health + 20);
            this.state.player.energy = Math.min(15, this.state.player.energy + 8);
            return "Used Potion: +20 HP, +8 Energy";
        }
        return `Used ${itemType}`;
    }

    // serialization for save/load system
    public saveState(): string {
        return JSON.stringify(this.state);
    }

    public loadState(json: string): void {
        try {
            const parsed = JSON.parse(json);
            // check if it has a player object
            if (!parsed.player) throw new Error();
            this.state = parsed;
        } catch (e) {
            throw new Error("Failed to load: Invalid state data.");
        }
    }

    public reset(): void {
        this.state = JSON.parse(this.initialState);
    }

    public getState(): GameState {
        return this.state;
    }
}