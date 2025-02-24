var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Matrix, Creature } from './matrix.js';
import { MatrixRenderer } from './matrixRenderer.js';
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
        // Add surrounding walls
        for (let x = 0; x < matrixWidth; x++) {
            matrix.addWall(x, 0, 'top'); // Top wall
            matrix.addWall(x, matrixHeight - 1, 'bottom'); // Bottom wall
        }
        for (let y = 0; y < matrixHeight; y++) {
            matrix.addWall(0, y, 'left'); // Left wall
            matrix.addWall(matrixWidth - 1, y, 'right'); // Right wall
        }
        // Add some internal walls
        matrix.addWall(1, 1, 'right');
        matrix.addWall(2, 2, 'bottom');
        // Add a creature (moved to (1,1) to avoid starting in the surrounding wall)
        const creature = new Creature(1);
        matrix.addCreature(creature, 1, 1);
        // Render the matrix
        renderer.render(matrix);
        // Example of moving the creature (adjusted for new starting position)
        setTimeout(() => {
            matrix.moveCreature(1, 1, 2, 1);
        }, 1000);
        setTimeout(() => {
            matrix.moveCreature(2, 1, 3, 1);
        }, 2000);
    });
}
initLabyrinth().catch(console.error);
