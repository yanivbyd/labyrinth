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
import { constructCreatures, constructWalls } from "./construct.js";
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
initLabyrinth().catch(console.error);
