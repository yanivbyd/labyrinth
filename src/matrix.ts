import {MatrixRenderer} from "./matrixRenderer";
import {Creature} from "./creature";
import {Cell, Food} from "./cell.js";
import {LabyrinthConfig} from "./config";

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

    addWall(x: number, y: number, direction: 'top' | 'right' | 'bottom' | 'left'): void {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.walls[direction] = true;

            // Add wall to adjacent cell
            let adjacentCell: Cell | null = null;
            switch (direction) {
                case 'top':
                    adjacentCell = this.getCell(x, y - 1);
                    if (adjacentCell) adjacentCell.walls.bottom = true;
                    break;
                case 'right':
                    adjacentCell = this.getCell(x + 1, y);
                    if (adjacentCell) adjacentCell.walls.left = true;
                    break;
                case 'bottom':
                    adjacentCell = this.getCell(x, y + 1);
                    if (adjacentCell) adjacentCell.walls.top = true;
                    break;
                case 'left':
                    adjacentCell = this.getCell(x - 1, y);
                    if (adjacentCell) adjacentCell.walls.right = true;
                    break;
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
            return !fromCell.walls[fromY < toY ? 'bottom' : 'top'];
        }

        if (fromY === toY && Math.abs(fromX - toX) === 1) {
            return !fromCell.walls[fromX < toX ? 'right' : 'left'];
        }

        return false;
    }

    canCreatureMoveTo(creature: Creature, toX: number, toY: number): boolean {
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

    private addFood() {
        const x = Math.floor(Math.random() * (this.width - 2)) + 1;
        const y = Math.floor(Math.random() * (this.height - 2)) + 1;
        if (!this.cells[y][x].food && !this.cells[y][x].creature) {
            this.cells[y][x].food = new Food(Math.ceil(Math.random() * 5));
            this.renderer.foodAdded(this.cells[y][x]);
        }
    }
}