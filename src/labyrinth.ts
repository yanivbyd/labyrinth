// labyrinth.ts

import { Matrix } from './matrix.js';
import { MatrixRenderer } from './matrixRenderer.js';
import { loadConfig } from "./config.js";
import { CreatureTable } from "./creatureTable.js";
import { constructMaze } from "./mazeConstructor.js";
import { constructCreatures } from "./creatureConstructor.js";

async function initLabyrinth() {
    const config = await loadConfig();

    const renderer = new MatrixRenderer('matrix-container', config.cellSizePx);
    const matrix = new Matrix(config, renderer);
    const creatureTable = CreatureTable.getInstance();

    constructMaze(matrix, config);
    constructCreatures(matrix, config, creatureTable);

    renderer.render(matrix);

    // Set up the cycle button
    const cycleButton = document.getElementById('cycle-button');
    if (cycleButton) {
        cycleButton.addEventListener('click', () => {
            console.log('cycle');
            matrix.cycle();
        });
    }

    // Set up the play/stop button
    const playStopButton = document.getElementById('play-stop-button');
    let intervalId: number | null = null;

    if (playStopButton) {
        playStopButton.addEventListener('click', () => {
            if (intervalId === null) {
                // Start playing
                intervalId = window.setInterval(() => {
                    matrix.cycle();
                }, 100);
                playStopButton.textContent = 'Stop';
            }
            else {
                // Stop playing
                window.clearInterval(intervalId);
                intervalId = null;
                playStopButton.textContent = 'Play';
            }
        });
    }
}

initLabyrinth().catch(console.error);