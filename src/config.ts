// config.ts

export class LabyrinthConfig {
    matrixWidth: number = 0;
    matrixHeight: number = 0;
    cellSizePx: number = 0;
    initialHealth: number = 0;
    maxHealth: number = 0;
    initialWatchRadius: number = 0;
    corridorWidth: number = 2;
}

export async function loadConfig(): Promise<LabyrinthConfig> {
    console.log('Loading configuration...');
    const response = await fetch('./labyrinth.json?t=' + Date.now());
    const respJson = await response.json();
    console.log('Loaded configuration:', respJson);
    
    const conf = new LabyrinthConfig();
    conf.matrixWidth = respJson.matrixWidth;
    conf.matrixHeight = respJson.matrixHeight;
    conf.cellSizePx = respJson.cellSizePx;
    conf.initialHealth = respJson.initialHealth;
    conf.maxHealth = respJson.maxHealth;
    conf.initialWatchRadius = respJson.initialWatchRadius;
    conf.corridorWidth = respJson.corridorWidth ?? 2; // Default to 2 if not specified
    
    console.log('Final configuration object:', conf);
    return conf;
}

