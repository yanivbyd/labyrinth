// creature.ts

import { Matrix } from './matrix';

export class Creature {
    type: number;
    id: number;
    div: HTMLDivElement | null;
    x: number;
    y: number;
    cycleCount: number;
    direction: 'up' | 'down' | 'left' | 'right' | null;

    constructor(type: number, id: number) {
        this.type = type;
        this.id = id;
        this.div = null;
        this.x = -1;
        this.y = -1;
        this.cycleCount = -1;
        this.direction = null;
    }

    cycle(matrix: Matrix) {
        if (this.cycleCount == matrix.cycleCount) return;
        this.cycleCount = matrix.cycleCount;

        // 20% chance to change direction even if we have momentum
        if (Math.random() < 0.2) {
            this.direction = null;
        }

        if (this.direction) {
            let newX = this.x;
            let newY = this.y;

            switch (this.direction) {
                case 'up':
                    newY--;
                    break;
                case 'down':
                    newY++;
                    break;
                case 'left':
                    newX--;
                    break;
                case 'right':
                    newX++;
                    break;
            }

            if (matrix.canCreatureMoveTo(this, newX, newY)) {
                console.log(`moving to (${newX}, ${newY})`);
                matrix.moveCreature(this, newX, newY);
                return;
            }
        }

        // If we couldn't move in the current direction (or didn't have one),
        // choose a new random direction
        const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
        directions.sort(() => Math.random() - 0.5); // Shuffle the directions

        for (const direction of directions) {
            let newX = this.x;
            let newY = this.y;
            switch (direction) {
                case 'up':
                    newY--;
                    break;
                case 'down':
                    newY++;
                    break;
                case 'left':
                    newX--;
                    break;
                case 'right':
                    newX++;
                    break;
            }

            if (matrix.canCreatureMoveTo(this, newX, newY)) {
                console.log(`moving to (${newX}, ${newY})`);
                matrix.moveCreature(this, newX, newY);
                this.direction = direction; // Set the new direction
                return;
            }
        }

        // If we couldn't move in any direction, reset the direction
        this.direction = null;
    }
}