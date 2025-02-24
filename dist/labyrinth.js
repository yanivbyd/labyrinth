// labyrinth.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Matrix } from './matrix.js';
import { MatrixRenderer } from './matrixRenderer.js';
import { Creature } from "./creature.js";
function loadConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('./labyrinth.json');
        return yield response.json();
    });
}
function initLabyrinth() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield loadConfig();
        const { matrixWidth, matrixHeight, cellSizePx } = config;
        const renderer = new MatrixRenderer('matrix-container', cellSizePx);
        const matrix = new Matrix(matrixWidth, matrixHeight, renderer);
        constructWalls(matrix, matrixWidth, matrixHeight);
        // Add a creature (moved to (1,1) to avoid starting in the surrounding wall)
        matrix.addCreature(new Creature(1), 1, 1);
        matrix.addCreature(new Creature(2), 5, 7);
        matrix.addCreature(new Creature(3), 7, 9);
        matrix.addCreature(new Creature(3), 7, 2);
        // Render the matrix
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
        let intervalId = null;
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
    });
}
function constructWalls(matrix, width, height) {
    // Add surrounding walls
    for (let x = 0; x < width; x++) {
        matrix.addWall(x, 0, 'top');
        matrix.addWall(x, height - 1, 'bottom');
    }
    for (let y = 0; y < height; y++) {
        matrix.addWall(0, y, 'left');
        matrix.addWall(width - 1, y, 'right');
    }
    // Add some internal walls to create a more interesting labyrinth
    // Vertical walls
    for (let y = 2; y < height - 2; y++) {
        matrix.addWall(Math.floor(width / 3), y, 'right');
        matrix.addWall(Math.floor(2 * width / 3), y, 'left');
    }
    // Horizontal walls
    for (let x = 2; x < width - 2; x++) {
        if (x !== Math.floor(width / 2)) {
            matrix.addWall(x, Math.floor(height / 3), 'bottom');
            matrix.addWall(x, Math.floor(2 * height / 3), 'top');
        }
    }
    // Add some random walls
    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * (width - 2)) + 1;
        const y = Math.floor(Math.random() * (height - 2)) + 1;
        const direction = Math.random() < 0.5 ? 'right' : 'bottom';
        matrix.addWall(x, y, direction);
    }
}
initLabyrinth().catch(console.error);
