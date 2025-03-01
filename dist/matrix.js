import { Cell, Food } from "./cell.js";
import { Direction, getOppositeDirection } from "./direction.js";
export class Matrix {
    constructor(config, renderer) {
        this.width = config.matrixWidth;
        this.height = config.matrixHeight;
        this.cells = [];
        this.renderer = renderer;
        this.cycleCount = -1;
        this.config = config;
        for (let y = 0; y < this.height; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.cells[y][x] = new Cell(x, y);
            }
        }
    }
    getCell(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.cells[y][x];
        }
        return null;
    }
    getAdjCell(x, y, direction) {
        switch (direction) {
            case Direction.Up:
                return this.getCell(x, y - 1);
            case Direction.Right:
                return this.getCell(x + 1, y);
            case Direction.Down:
                return this.getCell(x, y + 1);
            case Direction.Left:
                return this.getCell(x - 1, y);
        }
    }
    addWall(x, y, direction) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.walls[direction] = true;
            const adjacentCell = this.getAdjCell(x, y, direction);
            if (adjacentCell) {
                adjacentCell.walls[getOppositeDirection(direction)] = true;
            }
        }
    }
    removeWall(x, y, direction) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.walls[direction] = false;
            const adjacentCell = this.getAdjCell(x, y, direction);
            if (adjacentCell) {
                adjacentCell.walls[getOppositeDirection(direction)] = false;
            }
        }
    }
    addCreature(creature, x, y) {
        const cell = this.getCell(x, y);
        if (cell && !cell.creature) {
            cell.creature = creature;
            cell.creature.x = x;
            cell.creature.y = y;
            return true;
        }
        return false;
    }
    canMoveBetweenCells(fromCell, toCell, fromX, fromY, toX, toY) {
        if (!fromCell || !toCell || toCell.creature) {
            return false;
        }
        if (fromX === toX && Math.abs(fromY - toY) === 1) {
            return !fromCell.walls[fromY < toY ? Direction.Down : Direction.Up];
        }
        if (fromY === toY && Math.abs(fromX - toX) === 1) {
            return !fromCell.walls[fromX < toX ? Direction.Right : Direction.Left];
        }
        return false;
    }
    canCreatureMoveTo(creature, toX, toY) {
        if (toX < 0 || toX >= this.width || toY < 0 || toY >= this.height)
            return false;
        const fromCell = this.getCell(creature.x, creature.y);
        const toCell = this.getCell(toX, toY);
        return fromCell != null && toCell != null &&
            this.canMoveBetweenCells(fromCell, toCell, creature.x, creature.y, toX, toY);
    }
    moveCreature(creature, toX, toY) {
        const fromCell = this.getCell(creature.x, creature.y);
        const toCell = this.getCell(toX, toY);
        if (fromCell != null && toCell != null &&
            this.canMoveBetweenCells(fromCell, toCell, creature.x, creature.y, toX, toY)) {
            toCell.creature = creature;
            fromCell.creature = null;
            creature.x = toX;
            creature.y = toY;
            if (toCell.food != null) {
                creature.health = Math.min(creature.health + toCell.food.amount, this.config.maxHealth);
                this.renderer.removeFood(toCell.food);
                toCell.food = null;
            }
            this.renderer.updateCreaturePosition(creature);
            return toCell;
        }
        return null;
    }
    cycle() {
        this.cycleCount++;
        if (Math.random() < 0.15) {
            this.addFood();
        }
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.getCell(x, y);
                if (cell && cell.creature && cell.creature.health > 0) {
                    const creature = cell.creature;
                    creature.cycle(this);
                    if (Math.random() < 0.02) {
                        creature.health--;
                        if (creature.health == 0) {
                            this.renderer.creatureDead(creature);
                            creature.updateUI();
                        }
                    }
                }
            }
        }
    }
    addFood() {
        const x = Math.floor(Math.random() * (this.width - 2)) + 1;
        const y = Math.floor(Math.random() * (this.height - 2)) + 1;
        if (!this.cells[y][x].food && !this.cells[y][x].creature) {
            this.cells[y][x].food = new Food(Math.ceil(Math.random() * 10));
            this.renderer.foodAdded(this.cells[y][x]);
        }
    }
    creatureAttacking(attacker, defender) {
        var _a, _b;
        const attackerWinProbability = attacker.health / (attacker.health + defender.health);
        const attackerWon = Math.random() < attackerWinProbability;
        const winner = attackerWon ? attacker : defender;
        const loser = attacker ? defender : attacker;
        winner.health += Math.floor(loser.health / 2);
        winner.health = Math.min(winner.health, this.config.maxHealth);
        loser.health = Math.ceil(loser.health / 2);
        winner.battlesWon++;
        loser.battlesLost++;
        (_a = winner.div) === null || _a === void 0 ? void 0 : _a.classList.add('won_fight');
        (_b = loser.div) === null || _b === void 0 ? void 0 : _b.classList.add('lost_fight');
        setTimeout(() => {
            var _a, _b;
            (_a = winner.div) === null || _a === void 0 ? void 0 : _a.classList.remove('won_fight');
            (_b = loser.div) === null || _b === void 0 ? void 0 : _b.classList.remove('lost_fight');
        }, 2000); // 500ms matches the animation duration
    }
    isValidPosition(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return false;
        return true;
    }
}
