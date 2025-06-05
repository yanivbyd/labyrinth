export var Direction;
(function (Direction) {
    Direction["Up"] = "up";
    Direction["Down"] = "down";
    Direction["Left"] = "left";
    Direction["Right"] = "right";
})(Direction || (Direction = {}));
export const allDirections = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];
export class AdjacentCell {
    constructor(matrix, x, y, direction) {
        this.direction = direction;
        if (y >= matrix.height || y < 0 || x >= matrix.width || x < 0) {
            this.cell = null;
        }
        else {
            this.cell = matrix.cells[y][x];
        }
    }
}
export function getNewX(x, direction) {
    return x + (direction === Direction.Right ? 1 : direction === Direction.Left ? -1 : 0);
}
export function getNewY(y, direction) {
    return y + (direction === Direction.Down ? 1 : direction === Direction.Up ? -1 : 0);
}
export function getOppositeDirection(direction) {
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
