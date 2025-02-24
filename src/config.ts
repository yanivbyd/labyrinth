// config.ts

export class LabyrinthConfig {
    matrixWidth: number = 0;
    matrixHeight: number = 0;
    cellSizePx: number = 0;
    initialHealth: number = 0;
}

export async function loadConfig(): Promise<LabyrinthConfig> {
    const response = await fetch('./labyrinth.json?1');
    const respJson = await response.json();
    const conf = new LabyrinthConfig();
    conf.matrixWidth = respJson.matrixWidth;
    conf.matrixHeight = respJson.matrixHeight;
    conf.cellSizePx = respJson.cellSizePx;
    conf.initialHealth = respJson.initialHealth;
    return conf;
}

