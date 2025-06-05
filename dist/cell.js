export class Cell {
    constructor(x, y) {
        this.walls = {};
        this.creature = null;
        this.food = null;
        this.x = x;
        this.y = y;
    }
}
export class Food {
    constructor(amount) {
        this.amount = amount;
    }
}
