// construct.ts
import { Direction } from "./direction.js";
import { Creature } from "./creature.js";
export function constructCreatures(matrix, config, creatureTable) {
    let width = matrix.width;
    let height = matrix.height;
    const numberOfTypes = 6;
    let occupiedPositions = new Set();
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
        }
        else {
            // For the remaining creatures, choose randomly
            type = Math.floor(Math.random() * numberOfTypes);
        }
        const creature = new Creature(type, i, config.initialHealth, config.initialWatchRadius);
        matrix.addCreature(creature, x, y);
        creatureTable.addCreature(creature);
    }
}
export function constructWalls(matrix, config) {
    let width = matrix.width;
    let height = matrix.height;
    // First, fill everything with walls
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            matrix.addWall(x, y, Direction.Right);
            matrix.addWall(x, y, Direction.Down);
            matrix.addWall(x, y, Direction.Left);
            matrix.addWall(x, y, Direction.Up);
        }
    }
    // Create a visited array to track which cells have been visited
    const visited = Array(height).fill(false).map(() => Array(width).fill(false));
    // Create regions array at a higher scope
    const regions = Array(height).fill(0).map(() => Array(width).fill(-1));
    // Start from a random position that aligns with our corridor width
    const startX = config.corridorWidth;
    const startY = config.corridorWidth;
    // Run the recursive maze generation
    generateMaze(startX, startY);
    // Add outer walls
    for (let x = 0; x < width; x++) {
        matrix.addWall(x, 0, Direction.Up);
        matrix.addWall(x, height - 1, Direction.Down);
    }
    for (let y = 0; y < height; y++) {
        matrix.addWall(0, y, Direction.Left);
        matrix.addWall(width - 1, y, Direction.Right);
    }
    // Final connectivity pass
    ensureConnectivity();
    function ensureConnectivity() {
        // First pass: mark all connected regions
        let regionId = 0;
        // Reset regions array
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                regions[y][x] = -1;
            }
        }
        // Find all distinct regions
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (regions[y][x] === -1 && !isFullyEnclosed(x, y)) {
                    floodFill(x, y, regionId++);
                }
            }
        }
        // Multiple passes to ensure complete connectivity
        let previousRegionCount = regionId;
        let attempts = 0;
        const MAX_ATTEMPTS = 10;
        while (regionId > 1 && attempts < MAX_ATTEMPTS) {
            for (let id = 1; id < regionId; id++) {
                connectRegions(id - 1, id);
            }
            // Recheck regions after connections
            regionId = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    regions[y][x] = -1;
                }
            }
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (regions[y][x] === -1 && !isFullyEnclosed(x, y)) {
                        floodFill(x, y, regionId++);
                    }
                }
            }
            // If no improvement in connectivity, increment attempts
            if (regionId >= previousRegionCount) {
                attempts++;
            }
            previousRegionCount = regionId;
        }
    }
    function isFullyEnclosed(x, y) {
        // Don't consider border cells as fully enclosed by default
        // This allows the flood fill to consider them for connectivity
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            const cell = matrix.cells[y][x];
            // For border cells, check only their non-border walls
            if (x === 0)
                return Boolean(cell.walls[Direction.Up]) &&
                    Boolean(cell.walls[Direction.Right]) &&
                    Boolean(cell.walls[Direction.Down]);
            if (x === width - 1)
                return Boolean(cell.walls[Direction.Up]) &&
                    Boolean(cell.walls[Direction.Down]) &&
                    Boolean(cell.walls[Direction.Left]);
            if (y === 0)
                return Boolean(cell.walls[Direction.Right]) &&
                    Boolean(cell.walls[Direction.Down]) &&
                    Boolean(cell.walls[Direction.Left]);
            if (y === height - 1)
                return Boolean(cell.walls[Direction.Up]) &&
                    Boolean(cell.walls[Direction.Right]) &&
                    Boolean(cell.walls[Direction.Left]);
        }
        const cell = matrix.cells[y][x];
        return Boolean(cell.walls[Direction.Up]) &&
            Boolean(cell.walls[Direction.Right]) &&
            Boolean(cell.walls[Direction.Down]) &&
            Boolean(cell.walls[Direction.Left]);
    }
    function floodFill(x, y, id) {
        if (x < 0 || x >= width || y < 0 || y >= height ||
            isFullyEnclosed(x, y) || regions[y][x] !== -1)
            return;
        regions[y][x] = id;
        if (!matrix.cells[y][x].walls[Direction.Up])
            floodFill(x, y - 1, id);
        if (!matrix.cells[y][x].walls[Direction.Right])
            floodFill(x + 1, y, id);
        if (!matrix.cells[y][x].walls[Direction.Down])
            floodFill(x, y + 1, id);
        if (!matrix.cells[y][x].walls[Direction.Left])
            floodFill(x - 1, y, id);
    }
    function connectRegions(region1, region2) {
        let bestConnection = { x1: -1, y1: -1, x2: -1, y2: -1, distance: Infinity };
        let connections = [];
        // Find all possible connections between regions
        for (let y1 = 0; y1 < height; y1++) {
            for (let x1 = 0; x1 < width; x1++) {
                if (regions[y1][x1] === region1) {
                    // Check adjacent cells in all directions
                    const adjacentCells = [
                        { x: x1 + 1, y: y1 },
                        { x: x1 - 1, y: y1 },
                        { x: x1, y: y1 + 1 },
                        { x: x1, y: y1 - 1 }
                    ];
                    for (const { x: x2, y: y2 } of adjacentCells) {
                        if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height &&
                            regions[y2][x2] === region2) {
                            const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                            connections.push({ x1, y1, x2, y2, distance });
                        }
                    }
                }
            }
        }
        // Sort connections by distance and pick a random one from the shortest ones
        connections.sort((a, b) => a.distance - b.distance);
        if (connections.length > 0) {
            // Get all connections with the minimum distance
            const minDistance = connections[0].distance;
            const shortestConnections = connections.filter(c => c.distance === minDistance);
            // Pick a random connection from the shortest ones
            bestConnection = shortestConnections[Math.floor(Math.random() * shortestConnections.length)];
        }
        // Connect the regions
        if (bestConnection.x1 !== -1) {
            if (Math.abs(bestConnection.x2 - bestConnection.x1) === 1) {
                // Horizontal connection
                const x = Math.min(bestConnection.x1, bestConnection.x2);
                const y = bestConnection.y1;
                matrix.removeWall(x, y, Direction.Right);
                matrix.removeWall(x + 1, y, Direction.Left);
            }
            else {
                // Vertical connection
                const x = bestConnection.x1;
                const y = Math.min(bestConnection.y1, bestConnection.y2);
                matrix.removeWall(x, y, Direction.Down);
                matrix.removeWall(x, y + 1, Direction.Up);
            }
        }
    }
    function removeWallsInArea(startX, startY, endX, endY) {
        // First, ensure the area is connected internally
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (x < endX) {
                    matrix.removeWall(x, y, Direction.Right);
                    matrix.removeWall(x + 1, y, Direction.Left);
                }
                if (y < endY) {
                    matrix.removeWall(x, y, Direction.Down);
                    matrix.removeWall(x, y + 1, Direction.Up);
                }
                visited[y][x] = true;
            }
        }
    }
    function generateMaze(x, y) {
        visited[y][x] = true;
        // Define possible directions to move
        const directions = [
            { dx: 0, dy: -1, dir: Direction.Up, oppositeDir: Direction.Down },
            { dx: 1, dy: 0, dir: Direction.Right, oppositeDir: Direction.Left },
            { dx: 0, dy: 1, dir: Direction.Down, oppositeDir: Direction.Up },
            { dx: -1, dy: 0, dir: Direction.Left, oppositeDir: Direction.Right }
        ];
        // Shuffle directions randomly
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        // Try each direction
        for (const { dx, dy, dir, oppositeDir } of directions) {
            const nextX = x + (dx * config.corridorWidth);
            const nextY = y + (dy * config.corridorWidth);
            // Check if the next position and the corridor to it are within bounds and unvisited
            if (nextX > 0 && nextX + config.corridorWidth - 1 < width - 1 &&
                nextY > 0 && nextY + config.corridorWidth - 1 < height - 1 &&
                !visited[nextY][nextX]) {
                // Calculate the corridor area
                const corridorStartX = Math.min(x, nextX);
                const corridorStartY = Math.min(y, nextY);
                const corridorEndX = Math.max(x, nextX) + config.corridorWidth - 1;
                const corridorEndY = Math.max(y, nextY) + config.corridorWidth - 1;
                // Remove walls in the corridor area
                removeWallsInArea(corridorStartX, corridorStartY, corridorEndX, corridorEndY);
                // Recursively visit next cell
                generateMaze(nextX, nextY);
            }
        }
    }
}
