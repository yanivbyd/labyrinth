// creature.ts

import { Matrix } from './matrix';
import { CreatureTable } from "./creatureTable.js";

export enum Direction {
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right'
}

export class Creature {
    type: number;
    id: number;
    div: HTMLDivElement | null;
    x: number;
    y: number;
    cycleCount: number;
    direction: Direction | null;
    health: number;

    constructor(type: number, id: number, initialHealth: number) {
        this.type = type;
        this.id = id;
        this.div = null;
        this.health = initialHealth;
        this.x = -1;
        this.y = -1;
        this.cycleCount = -1;
        this.direction = null;
    }

    updateUI() {
        CreatureTable.getInstance().updateCreature(this);
    }

    cycle(matrix: Matrix) {
        if (this.cycleCount == matrix.cycleCount) return;
        this.cycleCount = matrix.cycleCount;

        if (this.moveToAdjacentFood(matrix)) return;

        this.updateDirection();
        this.moveInAvailableDirection(matrix);

        this.updateUI();
    }

    private moveToAdjacentFood(matrix: Matrix): boolean {
        const adjacentCells = this.getAdjacentCells();
        for (const { newX, newY, direction } of adjacentCells) {
            const cell = matrix.getCell(newX, newY);
            if (cell?.food && matrix.canCreatureMoveTo(this, newX, newY)) {
                matrix.moveCreature(this, newX, newY);
                this.direction = direction;
                return true;
            }
        }
        return false;
    }

    private updateDirection() {
        const changeDirectionChance = this.getChangeDirectionChance();
        if (Math.random() < changeDirectionChance) {
            this.direction = null;
        }
    }

    private moveInAvailableDirection(matrix: Matrix) {
        const directions = this.getShuffledDirections();
        for (const direction of directions) {
            const { newX, newY } = this.getNewCoordinates(direction);
            if (matrix.canCreatureMoveTo(this, newX, newY)) {
                matrix.moveCreature(this, newX, newY);
                this.direction = direction;
                return;
            }
        }
        this.direction = null;
    }

    private getChangeDirectionChance(): number {
        return (this.type / 15.0);
    }

    private getAdjacentCells(): { newX: number; newY: number; direction: Direction }[] {
        return [
            { newX: this.x, newY: this.y - 1, direction: Direction.Up },
            { newX: this.x + 1, newY: this.y, direction: Direction.Right },
            { newX: this.x, newY: this.y + 1, direction: Direction.Down },
            { newX: this.x - 1, newY: this.y, direction: Direction.Left }
        ];
    }

    private getShuffledDirections(): Direction[] {
        const directions: Direction[] = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
        if (this.direction) {
            const oppositeDirection = this.getOppositeDirection(this.direction);
            const filteredDirections = directions.filter(dir => dir !== oppositeDirection);
            filteredDirections.sort(() => Math.random() - 0.5);
            return [this.direction, ...filteredDirections];
        }
        return directions.sort(() => Math.random() - 0.5);
    }

    private getOppositeDirection(direction: Direction): Direction {
        const oppositeDirections: { [key in Direction]: Direction } = {
            [Direction.Up]: Direction.Down,
            [Direction.Down]: Direction.Up,
            [Direction.Left]: Direction.Right,
            [Direction.Right]: Direction.Left
        };
        return oppositeDirections[direction];
    }

    private getNewCoordinates(direction: Direction): { newX: number; newY: number } {
        let newX = this.x;
        let newY = this.y;
        switch (direction) {
            case Direction.Up: newY--; break;
            case Direction.Down: newY++; break;
            case Direction.Left: newX--; break;
            case Direction.Right: newX++; break;
        }
        return { newX, newY };
    }
}