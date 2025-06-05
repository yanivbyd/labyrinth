// creature.ts
import { CreatureTable } from "./creatureTable.js";
import { AdjacentCell, allDirections, Direction, getNewX, getNewY, getOppositeDirection } from "./direction.js";
export class Creature {
    constructor(type, id, initialHealth, watchRadius) {
        this.x = -1;
        this.y = -1;
        this.cycleCount = -1;
        this.battlesWon = 0;
        this.battlesLost = 0;
        this.direction = null;
        this.type = type;
        this.id = id;
        this.div = null;
        this.health = initialHealth;
        this.watchRadius = watchRadius;
    }
    updateUI() {
        CreatureTable.getInstance().updateCreature(this);
    }
    cycle(matrix) {
        if (this.cycleCount == matrix.cycleCount)
            return;
        this.cycleCount = matrix.cycleCount;
        if (this.attackNeighbour(matrix))
            return;
        if (this.moveTowardsFood(matrix))
            return;
        const adjCells = this.getAdjCells(matrix);
        if (adjCells.length == 0)
            return;
        if (adjCells.length > 1 && this.direction) {
            // don't go back unless you have to
            this.removeAdjCell(adjCells, getOppositeDirection(this.direction));
        }
        if (adjCells.length > 1 && this.direction && !this.shouldKeepMomentum()) {
            // change momentum
            this.removeAdjCell(adjCells, this.direction);
        }
        const momentum = this.findAdjacentCell(adjCells, this.direction);
        if (momentum) {
            this.moveTo(matrix, momentum);
        }
        else {
            const adjacentCell = adjCells[Math.floor(Math.random() * adjCells.length)];
            this.moveTo(matrix, adjacentCell);
        }
        this.updateUI();
    }
    moveTo(matrix, adjacentCell) {
        if (adjacentCell.cell) {
            if (matrix.moveCreature(this, adjacentCell.cell.x, adjacentCell.cell.y) != null) {
                this.direction = adjacentCell.direction;
                return true;
            }
        }
        return false;
    }
    removeAdjCell(adjacentCells, direction) {
        const index = adjacentCells.findIndex(cell => cell.direction === direction);
        if (index !== -1) {
            adjacentCells.splice(index, 1);
        }
    }
    shouldKeepMomentum() {
        return Math.random() >= (this.type / 20.0);
    }
    getAdjCells(matrix) {
        return [
            new AdjacentCell(matrix, this.x, this.y - 1, Direction.Up),
            new AdjacentCell(matrix, this.x + 1, this.y, Direction.Right),
            new AdjacentCell(matrix, this.x, this.y + 1, Direction.Down),
            new AdjacentCell(matrix, this.x - 1, this.y, Direction.Left)
        ].filter(adjacent => {
            return adjacent.cell && matrix.canCreatureMoveTo(this, adjacent.cell.x, adjacent.cell.y);
        });
    }
    findAdjacentCell(adjacentCells, direction) {
        for (const adjacentCell of adjacentCells) {
            if (adjacentCell.direction == direction) {
                return adjacentCell;
            }
        }
        return null;
    }
    attackNeighbour(matrix) {
        const neighbours = [
            new AdjacentCell(matrix, this.x, this.y - 1, Direction.Up),
            new AdjacentCell(matrix, this.x + 1, this.y, Direction.Right),
            new AdjacentCell(matrix, this.x, this.y + 1, Direction.Down),
            new AdjacentCell(matrix, this.x - 1, this.y, Direction.Left)
        ];
        for (const adjCell of neighbours) {
            if (adjCell.cell && !matrix.cells[this.y][this.x].walls[adjCell.direction]) {
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
    moveTowardsFood(matrix) {
        class QueueItem {
            constructor(x, y, steps, direction) {
                this.x = x;
                this.y = y;
                this.steps = steps;
                this.direction = direction;
            }
        }
        const queue = [new QueueItem(this.x, this.y, 0, null)];
        const visited = new Set();
        if (matrix.cells[this.y][this.x].food)
            return false;
        while (queue.length > 0) {
            const queueItem = queue.shift();
            if (matrix.cells[queueItem.y][queueItem.x].food && queueItem.direction) {
                return this.moveTo(matrix, new AdjacentCell(matrix, getNewX(this.x, queueItem.direction), getNewY(this.y, queueItem.direction), queueItem.direction));
            }
            if (queueItem.steps < this.watchRadius) {
                for (const direction of allDirections) {
                    const newX = getNewX(queueItem.x, direction);
                    const newY = getNewY(queueItem.y, direction);
                    const key = `${newX},${newY}`;
                    if (!visited.has(key) &&
                        matrix.isValidPosition(newX, newY) &&
                        !matrix.cells[newY][newX].creature &&
                        !matrix.cells[queueItem.y][queueItem.x].walls[direction]) {
                        visited.add(key);
                        queue.push(new QueueItem(newX, newY, queueItem.steps + 1, queueItem.direction || direction));
                    }
                }
            }
        }
        return false; // No food found within watch radius
    }
}
