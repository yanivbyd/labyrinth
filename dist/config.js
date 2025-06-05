// config.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class LabyrinthConfig {
    constructor() {
        this.matrixWidth = 0;
        this.matrixHeight = 0;
        this.cellSizePx = 0;
        this.initialHealth = 0;
        this.maxHealth = 0;
        this.initialWatchRadius = 0;
        this.corridorWidth = 2;
    }
}
export function loadConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('Loading configuration...');
        const response = yield fetch('./labyrinth.json?t=' + Date.now());
        const respJson = yield response.json();
        console.log('Loaded configuration:', respJson);
        const conf = new LabyrinthConfig();
        conf.matrixWidth = respJson.matrixWidth;
        conf.matrixHeight = respJson.matrixHeight;
        conf.cellSizePx = respJson.cellSizePx;
        conf.initialHealth = respJson.initialHealth;
        conf.maxHealth = respJson.maxHealth;
        conf.initialWatchRadius = respJson.initialWatchRadius;
        conf.corridorWidth = (_a = respJson.corridorWidth) !== null && _a !== void 0 ? _a : 2; // Default to 2 if not specified
        console.log('Final configuration object:', conf);
        return conf;
    });
}
