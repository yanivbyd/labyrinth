// creature.ts

import { Matrix } from './matrix';
import { CreatureTable } from "./creatureTable.js";
import {AdjacentCell, Direction, getOppositeDirection} from "./direction.js";

export class Creature {
    type: number;
    id: number;
    div: HTMLDivElement | null;
    x: number = -1;
    y: number = -1;
    cycleCount: number = -1;
    direction: Direction | null = null;
    health: number;

    constructor(type: number, id: number, initialHealth: number) {
        this.type = type;
        this.id = id;
        this.div = null;
        this.health = initialHealth;
    }

    updateUI() {
        CreatureTable.getInstance().updateCreature(this);
    }

    cycle(matrix: Matrix) {
        if (this.cycleCount == matrix.cycleCount) return;
        this.cycleCount = matrix.cycleCount;

        const adjacentCells: AdjacentCell[] = this.getAdjacentCells(matrix);
        if (adjacentCells.length == 0) return;

        if (this.moveToAdjacentFood(matrix, adjacentCells)) {
            console.log("move to food");
            return;
        }
        if (adjacentCells.length > 1 && this.direction) {
            // don't go back unless you have to
            this.removeAdjacentCell(adjacentCells, getOppositeDirection(this.direction));
        }
        if (adjacentCells.length > 1 && this.direction && !this.shouldKeepMomentum()) {
            // change momentum
            this.removeAdjacentCell(adjacentCells, this.direction);
        }

        const momentum: AdjacentCell | null = this.findAdjacentCell(adjacentCells, this.direction);
        if (momentum) {
            this.moveTo(matrix, momentum);
        } else {
            console.log("change momentum");
            const adjacentCell: AdjacentCell = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
            this.moveTo(matrix, adjacentCell);
        }

        this.updateUI();
    }

    private moveTo(matrix: Matrix, adjacentCell: AdjacentCell) {
        if (adjacentCell.cell) {
            matrix.moveCreature(this, adjacentCell.cell.x, adjacentCell.cell.y);
            this.direction = adjacentCell.direction;
        }
    }

    private removeAdjacentCell(adjacentCells: AdjacentCell[], direction: Direction): void {
        const index = adjacentCells.findIndex(cell => cell.direction === direction);
        if (index !== -1) {
            adjacentCells.splice(index, 1);
        }
    }

    private moveToAdjacentFood(matrix: Matrix, adjacentCells: AdjacentCell[]): boolean {
        for (const adjacentCell of adjacentCells) {
            if (adjacentCell.cell?.food) {
                this.moveTo(matrix, adjacentCell);
                return true;
            }
        }
        return false;
    }

    private shouldKeepMomentum(): boolean {
        return Math.random() >= (this.type / 20.0);
    }

    private getAdjacentCells(matrix: Matrix): AdjacentCell[] {
        return [
            new AdjacentCell(matrix, this.x, this.y - 1, Direction.Up),
            new AdjacentCell(matrix, this.x + 1, this.y, Direction.Right),
            new AdjacentCell(matrix, this.x, this.y + 1, Direction.Down),
            new AdjacentCell(matrix, this.x - 1, this.y, Direction.Left)
        ].filter(adjacent => {
            return adjacent.cell && matrix.canCreatureMoveTo(this, adjacent.cell.x, adjacent.cell.y);
        });
    }

    private findAdjacentCell(adjacentCells: AdjacentCell[], direction: Direction | null) {
        for (const adjacentCell of adjacentCells) {
            if (adjacentCell.direction == direction) {
                return adjacentCell;
            }
        }
        return null;
    }
}