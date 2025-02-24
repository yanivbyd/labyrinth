import { Cell, Food } from "./cell.js";
import { Direction } from "./direction.js";
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
    addWall(x, y, direction) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.walls[direction] = true;
            // Add wall to adjacent cell
            let adjacentCell = null;
            switch (direction) {
                case 'top':
                    adjacentCell = this.getCell(x, y - 1);
                    if (adjacentCell)
                        adjacentCell.walls.bottom = true;
                    break;
                case 'right':
                    adjacentCell = this.getCell(x + 1, y);
                    if (adjacentCell)
                        adjacentCell.walls.left = true;
                    break;
                case 'bottom':
                    adjacentCell = this.getCell(x, y + 1);
                    if (adjacentCell)
                        adjacentCell.walls.top = true;
                    break;
                case 'left':
                    adjacentCell = this.getCell(x - 1, y);
                    if (adjacentCell)
                        adjacentCell.walls.right = true;
                    break;
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
            return !fromCell.walls[fromY < toY ? 'bottom' : 'top'];
        }
        if (fromY === toY && Math.abs(fromX - toX) === 1) {
            return !fromCell.walls[fromX < toX ? 'right' : 'left'];
        }
        return false;
    }
    canCreatureMoveTo(creature, toX, toY) {
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
        if (Math.random() < 0.05) {
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
    hasWall(cell, direction) {
        switch (direction) {
            case Direction.Down:
                return cell.walls.bottom;
            case Direction.Up:
                return cell.walls.top;
            case Direction.Left:
                return cell.walls.left;
            case Direction.Right:
                return cell.walls.right;
        }
        return false;
    }
    creatureAttacking(attacker, defender) {
        const attackerWinProbability = attacker.health / (attacker.health + defender.health);
        const attackerWon = Math.random() < attackerWinProbability;
        if (attackerWon) {
            attacker.health += Math.floor(defender.health / 2);
            defender.health = Math.ceil(defender.health / 2);
            defender.battlesLost++;
            attacker.battlesWon++;
            console.log("defender lost, new health = " + defender.health);
        }
        else {
            defender.health += Math.floor(attacker.health / 2);
            attacker.health = Math.ceil(attacker.health / 2);
            attacker.battlesLost++;
            defender.battlesWon++;
            console.log("attacker lost, new health = " + attacker.health);
        }
    }
}
