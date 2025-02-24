import {MatrixRenderer} from "./matrixRenderer";
import {Creature} from "./creature";
export { Cell, Matrix };

class Cell {
    x: number;
    y: number;
    walls: {
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    };
    creature: Creature | null;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.walls = {
            top: false,
            right: false,
            bottom: false,
            left: false,
        };
        this.creature = null;
    }
}

class Matrix {
    width: number;
    height: number;
    cells: Cell[][];
    renderer: MatrixRenderer;
    cycleCount: number;

    constructor(width: number, height: number, renderer: MatrixRenderer) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.renderer = renderer;
        this.cycleCount = -1;

        for (let y = 0; y < height; y++) {
            this.cells[y] = [];
            for (let x = 0; x < width; x++) {
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

    moveCreature(creature: Creature, toX: number, toY: number): boolean {
        const fromCell = this.getCell(creature.x, creature.y);
        const toCell = this.getCell(toX, toY);

        if (fromCell != null && toCell != null &&
            this.canMoveBetweenCells(fromCell, toCell, creature.x, creature.y, toX, toY)) {
            toCell.creature = creature;
            fromCell.creature = null;
            creature.x = toX;
            creature.y = toY;

            this.renderer.updateCreaturePosition(creature);
            return true;
        }
        return false;
    }

    cycle() {
        this.cycleCount++;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.getCell(x, y);
                if (cell && cell.creature) {
                    cell.creature.cycle(this);
                }
            }
        }
    }
}