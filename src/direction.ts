import {Cell} from "./cell";
import {Matrix} from "./matrix";

export enum Direction {
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right'
}

export const allDirections: Direction[] = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];

export class AdjacentCell {
    direction: Direction;
    cell: Cell | null;

    constructor(matrix: Matrix, x: number, y: number, direction: Direction) {
        this.direction = direction;
        if (y >= matrix.height || y < 0 || x >= matrix.width || x < 0) {
            this.cell = null;
        } else {
            this.cell = matrix.cells[y][x];
        }
    }
}

export function getNewX(x: number, direction: Direction): number {
    return x + (direction === Direction.Right ? 1 : direction === Direction.Left ? -1 : 0);
}

export function getNewY(y: number, direction: Direction): number {
    return y + (direction === Direction.Down ? 1 : direction === Direction.Up ? -1 : 0);
}

export function getOppositeDirection(direction: Direction): Direction {
    switch (direction) {
        case Direction.Down:
            return Direction.Up;
        case Direction.Up:
            return Direction.Down;
        case Direction.Left:
            return Direction.Right;
        case Direction.Right:
            return Direction.Left;
        default:
            throw new Error(`Invalid direction: ${direction}`);
    }
}