// creature.ts

import { Matrix } from './matrix';
import {CreatureTable} from "./creatureTable.js";

export class Creature {
    type: number;
    id: number;
    div: HTMLDivElement | null;
    x: number;
    y: number;
    cycleCount: number;
    direction: 'up' | 'down' | 'left' | 'right' | null;
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

        // Chance to change direction based on creature type
        let changeDirectionChance: number;
        switch (this.type) {
            case 0: changeDirectionChance = 0.8; break;
            case 1: changeDirectionChance = 0.5; break;
            case 2: changeDirectionChance = 0.1; break;
            default: changeDirectionChance = 0.2;
        }

        if (Math.random() < changeDirectionChance) {
            this.direction = null;
        }

        const oppositeDirection = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        let directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];

        // Remove the opposite of the current direction from the options
        if (this.direction) {
            directions = directions.filter(dir => dir !== oppositeDirection[this.direction]);
        }

        // Shuffle the remaining directions
        directions.sort(() => Math.random() - 0.5);

        // Try to move in the current direction first if it exists
        if (this.direction) {
            directions.unshift(this.direction);
        }

        for (const direction of directions) {
            let newX = this.x;
            let newY = this.y;
            switch (direction) {
                case 'up': newY--; break;
                case 'down': newY++; break;
                case 'left': newX--; break;
                case 'right': newX++; break;
            }

            if (matrix.canCreatureMoveTo(this, newX, newY)) {
                matrix.moveCreature(this, newX, newY);
                this.direction = direction; // Set the new direction
                this.updateUI();
                return;
            }
        }

        // If we couldn't move in any other direction, try the opposite direction as a last resort
        if (this.direction) {
            const lastResortDirection = oppositeDirection[this.direction];
            let newX = this.x;
            let newY = this.y;
            switch (lastResortDirection) {
                case 'up': newY--; break;
                case 'down': newY++; break;
                case 'left': newX--; break;
                case 'right': newX++; break;
            }

            if (matrix.canCreatureMoveTo(this, newX, newY)) {
                matrix.moveCreature(this, newX, newY);
                this.direction = lastResortDirection as 'up' | 'down' | 'left' | 'right';
                this.updateUI();
                return;
            }
        }

        // If we couldn't move in any direction, reset the direction
        this.direction = null;
    }
}