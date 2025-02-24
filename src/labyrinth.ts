// labyrinth.ts

import { Matrix } from './matrix.js';
import { MatrixRenderer } from './matrixRenderer.js';
import {constructCreatures, constructWalls} from "./construct.js";

async function loadConfig() {
    const response = await fetch('./labyrinth.json');
    return await response.json();
}

async function initLabyrinth() {
    const config = await loadConfig();
    const { matrixWidth, matrixHeight, cellSizePx } = config;

    const renderer = new MatrixRenderer('matrix-container', cellSizePx);
    const matrix = new Matrix(matrixWidth, matrixHeight, renderer);

    constructWalls(matrix);
    constructCreatures(matrix);

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
            } else {
                // Stop playing
                window.clearInterval(intervalId);
                intervalId = null;
                playStopButton.textContent = 'Play';
            }
        });
    }
}

initLabyrinth().catch(console.error);