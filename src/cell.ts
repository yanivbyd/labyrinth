import {Creature} from "./creature";
import {Direction} from "./direction";

type Walls = {
    [key in Direction]?: boolean;
};

export class Cell {
    x: number;
    y: number;
    walls: Walls = {};
    creature: Creature | null = null;
    food: Food | null = null;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Food {
    amount: number;
    div: HTMLDivElement | undefined;

    constructor(amount: number) {
        this.amount = amount;
    }
}