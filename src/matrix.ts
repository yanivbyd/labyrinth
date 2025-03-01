import {MatrixRenderer} from "./matrixRenderer";
import {Creature} from "./creature";
import {Cell, Food} from "./cell.js";
import {LabyrinthConfig} from "./config";
import {Direction, getOppositeDirection} from "./direction.js";

export class Matrix {
    width: number;
    height: number;
    cells: Cell[][];
    renderer: MatrixRenderer;
    cycleCount: number;
    config: LabyrinthConfig;

    constructor(config: LabyrinthConfig, renderer: MatrixRenderer) {
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

    getCell(x: number, y: number): Cell | null {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.cells[y][x];
        }
        return null;
    }

    addWall(x: number, y: number, direction: Direction): void {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.walls[direction] = true;

            // Add wall to adjacent cell
            let adjacentCell: Cell | null = null;

            switch (direction) {
                case Direction.Up:
                    adjacentCell = this.getCell(x, y - 1);
                    break;
                case Direction.Right:
                    adjacentCell = this.getCell(x + 1, y);
                    break;
                case Direction.Down:
                    adjacentCell = this.getCell(x, y + 1);
                    break;
                case Direction.Left:
                    adjacentCell = this.getCell(x - 1, y);
                    break;
            }

            if (adjacentCell) {
                adjacentCell.walls[getOppositeDirection(direction)] = true;
            }
        }
    }

    addCreature(creature: Creature, x: number, y: number): boolean {
        const cell = this.getCell(x, y);
        if (cell && !cell.creature) {
            cell.creature = creature;
            cell.creature.x = x;
            cell.creature.y = y;
            return true;
        }
        return false;
    }

    private canMoveBetweenCells(fromCell: Cell, toCell: Cell, fromX: number, fromY: number, toX: number, toY: number): boolean {
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

    canCreatureMoveTo(creature: Creature, toX: number, toY: number): boolean {
        if (toX < 0 || toX >= this.width || toY < 0 || toY >= this.height) return false;
        const fromCell = this.getCell(creature.x, creature.y);
        const toCell = this.getCell(toX, toY);
        return fromCell != null && toCell != null &&
            this.canMoveBetweenCells(fromCell, toCell, creature.x, creature.y, toX, toY);
    }

    moveCreature(creature: Creature, toX: number, toY: number): Cell | null {
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

    private addFood() {
        const x = Math.floor(Math.random() * (this.width - 2)) + 1;
        const y = Math.floor(Math.random() * (this.height - 2)) + 1;
        if (!this.cells[y][x].food && !this.cells[y][x].creature) {
            this.cells[y][x].food = new Food(Math.ceil(Math.random() * 10));
            this.renderer.foodAdded(this.cells[y][x]);
        }
    }

    creatureAttacking(attacker: Creature, defender: Creature) {
        const attackerWinProbability = attacker.health / (attacker.health + defender.health);
        const attackerWon = Math.random() < attackerWinProbability;

        const winner = attackerWon ? attacker : defender;
        const loser = attacker ? defender : attacker;

        winner.health += Math.floor(loser.health / 2);
        winner.health = Math.min(winner.health, this.config.maxHealth);
        loser.health = Math.ceil(loser.health / 2);
        winner.battlesWon++;
        loser.battlesLost++;

        winner.div?.classList.add('won_fight');
        loser.div?.classList.add('lost_fight');
        setTimeout(() => {
            winner.div?.classList.remove('won_fight');
            loser.div?.classList.remove('lost_fight');
        }, 2000); // 500ms matches the animation duration
    }

    isValidPosition(x: number, y: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return true;
    }
}