import {Creature} from "./creature";

export class Cell {
    x: number;
    y: number;
    walls: {
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    };
    creature: Creature | null = null;
    food: Food | null = null;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.walls = {
            top: false,
            right: false,
            bottom: false,
            left: false,
        };
    }
}

export class Food {
    amount: number;
    div: HTMLDivElement | undefined;

    constructor(amount: number) {
        this.amount = amount;
    }
}