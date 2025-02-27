// creature.ts

import { Matrix } from './matrix';
import { CreatureTable } from "./creatureTable.js";
import {AdjacentCell, Direction, getNewX, getNewY, getOppositeDirection} from "./direction.js";

export class Creature {
    type: number;
    id: number;
    div: HTMLDivElement | null;
    x: number = -1;
    y: number = -1;
    cycleCount: number = -1;
    battlesWon: number = 0;
    battlesLost: number = 0;
    direction: Direction | null = null;
    health: number;
    watchRadius: number;

    constructor(type: number, id: number, initialHealth: number, watchRadius: number) {
        this.type = type;
        this.id = id;
        this.div = null;
        this.health = initialHealth;
        this.watchRadius = watchRadius;
    }

    updateUI() {
        CreatureTable.getInstance().updateCreature(this);
    }

    cycle(matrix: Matrix) {
        if (this.cycleCount == matrix.cycleCount) return;
        this.cycleCount = matrix.cycleCount;
        if (this.attackNeighbour(matrix)) return;
        if (this.moveTowardsFood(matrix)) return;

        const adjCells: AdjacentCell[] = this.getAdjCells(matrix);
        if (adjCells.length == 0) return;

        if (adjCells.length > 1 && this.direction) {
            // don't go back unless you have to
            this.removeAdjCell(adjCells, getOppositeDirection(this.direction));
        }
        if (adjCells.length > 1 && this.direction && !this.shouldKeepMomentum()) {
            // change momentum
            this.removeAdjCell(adjCells, this.direction);
        }

        const momentum: AdjacentCell | null = this.findAdjacentCell(adjCells, this.direction);
        if (momentum) {
            this.moveTo(matrix, momentum);
        } else {
            const adjacentCell: AdjacentCell = adjCells[Math.floor(Math.random() * adjCells.length)];
            this.moveTo(matrix, adjacentCell);
        }

        this.updateUI();
    }

    private moveTo(matrix: Matrix, adjacentCell: AdjacentCell): boolean {
        if (adjacentCell.cell) {
            if (matrix.moveCreature(this, adjacentCell.cell.x, adjacentCell.cell.y) != null) {
                this.direction = adjacentCell.direction;
                return true;
            }
        }
        return false;
    }

    private removeAdjCell(adjacentCells: AdjacentCell[], direction: Direction): void {
        const index = adjacentCells.findIndex(cell => cell.direction === direction);
        if (index !== -1) {
            adjacentCells.splice(index, 1);
        }
    }

    private shouldKeepMomentum(): boolean {
        return Math.random() >= (this.type / 20.0);
    }

    private getAdjCells(matrix: Matrix): AdjacentCell[] {
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

    private attackNeighbour(matrix: Matrix): boolean {
        const neighbours = [
            new AdjacentCell(matrix, this.x, this.y - 1, Direction.Up),
            new AdjacentCell(matrix, this.x + 1, this.y, Direction.Right),
            new AdjacentCell(matrix, this.x, this.y + 1, Direction.Down),
            new AdjacentCell(matrix, this.x - 1, this.y, Direction.Left)
        ];
        for (const adjCell of neighbours) {
            if (adjCell.cell && !matrix.hasWall(matrix.cells[this.y][this.x], adjCell.direction)) {
                const toAttack = adjCell.cell.creature;
                if (toAttack && toAttack.cycleCount <= this.cycleCount && this.health > toAttack.health
                    && toAttack.health > 0) {
                    matrix.creatureAttacking(this, toAttack);
                    return true;
                }
            }
        }
        return false;
    }

    private moveTowardsFood(matrix: Matrix): boolean {
        class QueueItem {
            x: number;
            y: number;
            steps : number;
            direction: Direction | null;

            constructor(x: number, y: number, steps: number, direction: Direction | null) {
                this.x = x;
                this.y = y;
                this.steps = steps;
                this.direction = direction;
            }
        }

        const directions: Direction[] = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];
        const queue: QueueItem[] = [new QueueItem(this.x, this.y, 0, null)];
        const visited: Set<string> = new Set();

        if (matrix.cells[this.y][this.x].food) return false;

        while (queue.length > 0) {
            const queueItem = queue.shift()!;

            if (matrix.cells[queueItem.y][queueItem.x].food && queueItem.direction) {
                return this.moveTo(matrix, new AdjacentCell(matrix,
                    getNewX(this.x, queueItem.direction),
                    getNewY(this.y, queueItem.direction),
                    queueItem.direction));
            }

            if (queueItem.steps < this.watchRadius) {
                for (const direction of directions) {
                    const newX = getNewX(queueItem.x, direction);
                    const newY = getNewY(queueItem.y, direction);
                    const key = `${newX},${newY}`;

                    if (
                        !visited.has(key) &&
                        matrix.isValidPosition(newX, newY) &&
                        !matrix.cells[newY][newX].creature &&
                        !matrix.hasWall(matrix.cells[queueItem.y][queueItem.x], direction)
                    ) {
                        visited.add(key);
                        queue.push(new QueueItem(newX, newY, queueItem.steps+1,
                            queueItem.direction || direction));
                    }
                }
            }
        }

        return false; // No food found within watch radius
    }

}