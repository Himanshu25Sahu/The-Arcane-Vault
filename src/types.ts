export enum EntityType {
    KEY = "KEY",
    GATE = "GATE",
    POTION = "POTION"
}

export interface Position { x: number; y: number; }

export interface GameEntity {
    id: string;
    type: EntityType;
    pos: Position;
    collected: boolean;
}

export interface GameState {
    player: {
        pos: Position;
        health: number;
        inventory: string[];
        energy: number;
    };
    world: {
        gridSize: number;
        entities: GameEntity[];
        isGateOpen: boolean;
    };
}