# 🏰 THE ARCADE VAULT
## Game State Management System

The Arcade Vault is a terminal-based 2D game built in TypeScript to demonstrate **game state management principles**.  

This project showcases clean state design, controlled transitions, and data persistence—specifically created for the Technical Assessment.

---

## 🔗 Project Links & Deliverables

* **GitHub Repository:** [https://github.com/Himanshu25Sahu/The-Arcane-Vault](https://github.com/Himanshu25Sahu/The-Arcane-Vault)
* **Video Walkthrough, Screenshots & Assignment PDF:** [Google Drive](https://drive.google.com/drive/folders/1LKwQporAcJ9lD68peQfHzmux-p93TfAS?usp=drive_link)
* **Documentation:** This README contains all design rationale and implementation details

---

## 🎯 Project Objective

Create a simple 2D game world to demonstrate state management:

- Player navigates a 5×5 grid
- Find a **Key** to unlock the **Gate**
- Reach the unlocked Gate to win

**Key Constraint:** No game engine used—all behavior driven by pure state and logic.

---

## 🚀 Setup & Execution

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
git clone https://github.com/Himanshu25Sahu/The-Arcane-Vault.git  
cd The-Arcane-Vault  
npm install  
```

### Run the Game
```bash
npm start  
```

### Run Tests
```bash
npm test  
```

---

## 📁 Project Structure
```
src/
├── index.ts     # CLI loop and user input handling
├── engine.ts    # Core game logic and state transitions
├── types.ts     # State and entity type definitions
├── ui.ts        # Terminal grid rendering
```

---

## 🏗 System Architecture

### Game State Representation

The entire game uses a single `GameState` object that contains:

**Player State:**
- Position (x, y coordinates)
- Health and Energy levels
- Inventory (items collected)

**World State:**
- Grid dimensions (5×5)
- Entity locations (Key, Potion, Gate)
- Gate status (locked/unlocked)

**Design Decisions:**
- **Interfaces** define clear state structure and prevent errors
- **Enums** for entity types (no "magic strings" like "potion" vs "Potion")
- **Arrays** for entities—simple and efficient for small grids
- **Single source of truth**—all state controlled by GameEngine class

---

## 🔄 State Transitions

All state changes happen exclusively inside the `GameEngine` class.

### 1. Player Movement
```typescript
movePlayer(newX, newY)
```
- Validates movement is adjacent (up/down/left/right only)
- Prevents moving outside grid boundaries
- Consumes energy with each move
- Checks for item collisions

### 2. Item Pickup
```typescript
pickupItem(itemId)
```
- Removes item from world
- Adds to player inventory
- **Special:** Picking up Key automatically unlocks Gate

### 3. Item Usage
```typescript
useItem(EntityType.POTION)
```
- Checks item exists in inventory
- Applies effects (restore health/energy)
- Removes item after use
- Caps values to prevent invalid states

**Why Centralize Everything?**
- Guarantees a single source of truth
- Prevents bugs from partial or conflicting updates
- Makes testing and debugging straightforward

---

## 💾 State Persistence

The game can save and load state using JSON.

```typescript
saveState(): string      // Serialize current state
loadState(json: string)  // Restore from saved state
```

**Why JSON?**
- Human-readable (easy to debug)
- Native JavaScript support
- Simple serialization/deserialization
- Includes validation to prevent corrupted saves from breaking the game

---

## 🛡 Edge Cases & Validation

The system handles edge cases gracefully:

✅ **Invalid Movement**
- Out of bounds moves are blocked
- Non-adjacent moves rejected
- Movement without energy prevented

✅ **Item Management**
- Can't use items not in inventory
- Can't exit through locked Gate

✅ **Data Integrity**
- Save/load validates JSON structure
- Health and energy capped at valid ranges
- State reset available without restarting

---

## 🔁 State Reset Feature

The initial game state is stored as a deep copy at startup.  
Calling `reset()` restores the original state instantly—no restart needed.

---

## 🧩 Game Logic Examples

### Gate Unlocking
Gate state is a simple boolean in world state.  
When Key is picked up → `isGateOpen = true`

### Collision Detection
Player position compared with entity positions during each move.

### Future Extensions
Distance calculations could enable:
- Enemy proximity detection
- Sound propagation systems
- Field of view mechanics

---

## 🔀 Scalability Considerations

**Current Design:**  
Single-threaded, synchronous state updates.

**If Expanded to Handle:**
- Multiple AI agents
- Networked multiplayer
- Event-driven systems

**Solution:** Implement an **Action Queue**
- All systems submit actions to a queue
- Engine processes one action per tick
- Prevents race conditions and maintains state consistency

---

## 🧱 Extensibility

The architecture supports easy expansion:

| Addition | Implementation |
|----------|----------------|
| New entity types | Add to `EntityType` enum |
| Player attributes | Extend player state interface |
| New mechanics | Create new engine methods |

**Example:** Adding enemies would require:
- New `Enemy` entity type
- Enemy position tracking in world state
- Combat logic as engine methods

---

## 🧠 Design Philosophy & Trade-offs

### Key Choices

**Object-Oriented Approach**  
Wrapped state in GameEngine class to create a single source of truth and prevent accidental mutations from UI layer.

**Simple Data Structures**  
Used arrays and objects instead of Maps or complex structures—clarity over premature optimization for a 5×5 grid.

**Synchronous File I/O**  
Saves block briefly but guarantee complete writes—no risk of corrupted partial saves.

### Alternatives Considered

**Maps vs Arrays**  
Maps offer O(1) lookup but arrays are simpler and faster for small datasets.

**Immutable State Updates**  
Would add complexity without clear benefit at this scale.

**Async Save/Load**  
Could improve performance but risks partial writes in CLI environment.

### Trade-offs

**JSON Deep Cloning:** Simple but not ideal for large games  
**Validation Level:** Basic checks sufficient for prototype  
**Performance:** Optimizations deferred in favor of code clarity

---

## 🤖 AI Assistance Disclosure

I used **Gemini** as a technical thought partner, not a code generator.

**Specific Use Cases:**
- **Logic refinement:** Ensuring Key, Potion, and Exit spawn without overlaps
- **Test structure:** Setting up Vitest with proper mocking patterns
- **Code review:** Checking for separation of concerns and edge cases

**Important:** All design decisions, implementations, and code were manually written and thoroughly reviewed by me.

---

## 🎮 How to Play

**Controls:**
- Move: `U` (up), `D` (down), `L` (left), `R` (right)
- Use item: `use potion`
- Save game: `save`
- Load game: `load`
- Reset game: `reset`
- Quit: `quit`

**Objective:**  
Find the Key (K) → Unlock the Gate (◈) → Reach the Gate (◉) to escape!

---

## ✅ What This Project Demonstrates

🎯 **Core Competencies:**
- Clear data structure design
- Controlled state transitions with validation
- JSON-based persistence
- Comprehensive edge case handling
- Scalable and extensible architecture

🎯 **Software Engineering Principles:**
- Single source of truth
- Separation of concerns
- Defensive programming
- Clean, testable code structure

**Focus:** This project emphasizes **state management**—the foundation of all game logic—over graphics or visual effects.

---

## 📊 Project Statistics

- **Lines of Code:** ~370 (excluding tests)
- **Test Coverage:** Core game logic fully tested
- **Development Time:** ~12 hours
- **Dependencies:** Minimal (TypeScript, Vitest)

---

*Built with careful attention to state management principles and clean architecture. All code manually written and reviewed.*