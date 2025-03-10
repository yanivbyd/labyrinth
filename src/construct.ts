// construct.ts

import {Direction} from "./direction.js";
import {Matrix} from './matrix.js';
import {Creature} from "./creature.js";
import {LabyrinthConfig} from "./config";
import {CreatureTable} from "./creatureTable";

export function constructCreatures(matrix: Matrix, config: LabyrinthConfig, creatureTable: CreatureTable) {
    let width = matrix.width;
    let height = matrix.height;
    const numberOfTypes = 6;
    let occupiedPositions = new Set<string>();

    for (let i = 0; i < 10; i++) {
        let x, y;
        let positionKey;

        // Keep generating positions until we find an unoccupied one
        do {
            x = Math.floor(Math.random() * (width - 2)) + 1;
            y = Math.floor(Math.random() * (height - 2)) + 1;
            positionKey = `${x},${y}`;
        } while (occupiedPositions.has(positionKey));

        // Mark this position as occupied
        occupiedPositions.add(positionKey);

        let type;
        if (i < numberOfTypes) {
            // For the first three creatures, use each type once
            type = i;
        } else {
            // For the remaining creatures, choose randomly
            type = Math.floor(Math.random() * numberOfTypes);
        }

        const creature = new Creature(type, i, config.initialHealth, config.initialWatchRadius);
        matrix.addCreature(creature, x, y);
        creatureTable.addCreature(creature);
    }
}

export function constructWalls(matrix: Matrix, config: LabyrinthConfig) {
    let width = matrix.width;
    let height = matrix.height;

    // Add surrounding walls
    for (let x = 0; x < width; x++) {
        matrix.addWall(x, 0, Direction.Up);
        matrix.addWall(x, height - 1, Direction.Down);
    }
    for (let y = 0; y < height; y++) {
        matrix.addWall(0, y, Direction.Left);
        matrix.addWall(width - 1, y, Direction.Right);
    }

    // Add some internal walls to create a more interesting labyrinth

// Vertical walls
    for (let x = Math.floor(width / 4); x < width - Math.floor(width / 4); x += Math.floor(width / 4)) {
        let wallLength = Math.floor(Math.random() * (height / 2)) + Math.floor(height / 4);
        let startY = Math.floor(Math.random() * (height - wallLength));
        for (let y = startY; y < startY + wallLength; y++) {
            if (Math.random() < 0.8) { // 80% chance to add a wall segment
                matrix.addWall(x, y, Math.random() < 0.5 ? Direction.Right : Direction.Left);
            }
        }
    }

// Horizontal walls
    for (let y = Math.floor(height / 4); y < height - Math.floor(height / 4); y += Math.floor(height / 4)) {
        let wallLength = Math.floor(Math.random() * (width / 2)) + Math.floor(width / 4);
        let startX = Math.floor(Math.random() * (width - wallLength));
        for (let x = startX; x < startX + wallLength; x++) {
            if (Math.random() < 0.8) { // 80% chance to add a wall segment
                matrix.addWall(x, y, Math.random() < 0.5 ? Direction.Down : Direction.Up);
            }
        }
    }

    // Add some random walls
    for (let i = 0; i < 30; i++) {
        const x = Math.floor(Math.random() * (width - 2)) + 1;
        const y = Math.floor(Math.random() * (height - 2)) + 1;
        const direction: Direction = Math.random() < 0.5 ? Direction.Right : Direction.Down;
        matrix.addWall(x, y, direction);
    }
}