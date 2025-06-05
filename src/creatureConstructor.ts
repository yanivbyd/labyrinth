// creatureConstructor.ts

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