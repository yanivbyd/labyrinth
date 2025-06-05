// mazeConstructor.ts

import {Direction} from "./direction.js";
import {Matrix} from './matrix.js';
import {LabyrinthConfig} from "./config";

export function constructMaze(matrix: Matrix, config: LabyrinthConfig) {
    let width = matrix.width;
    let height = matrix.height;

    for (let y = 0; y < height - config.corridorWidth; y++) {
        for (let x = 0; x < width - config.corridorWidth; x++) {
            matrix.addWall(x, y, Direction.Right);
            matrix.addWall(x, y, Direction.Down);
            matrix.addWall(x, y, Direction.Left);
            matrix.addWall(x, y, Direction.Up);
        }
    }
    
    // Create a visited array to track which cells have been visited
    const visited: boolean[][] = Array(height).fill(false).map(() => Array(width).fill(false));
    // Create regions array at a higher scope
    const regions: number[][] = Array(height).fill(0).map(() => Array(width).fill(-1));

    // Start from (0,0) instead of corridorWidth
    const startX = 0;
    const startY = 0;
    
    generateMaze(startX, startY);
    randomlyBreakWalls(0.02);
    addOuterBorderWalls();

    function addOuterBorderWalls() {
        // Add outer border walls
        for (let x = 0; x < width; x++) {
            matrix.addWall(x, 0, Direction.Up);  // Top border
            matrix.addWall(x, height - 1, Direction.Down);  // Bottom border
        }
        for (let y = 0; y < height; y++) {
            matrix.addWall(0, y, Direction.Left);  // Left border
            matrix.addWall(width - 1, y, Direction.Right);  // Right border
        }
    }

    function shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];  // Create a copy to avoid mutating the original
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function generateMaze(x: number, y: number) {
        visited[y][x] = true;

        // Define possible directions to move
        const directions = [
            { dx: 0, dy: -1, dir: Direction.Up, oppositeDir: Direction.Down },
            { dx: 1, dy: 0, dir: Direction.Right, oppositeDir: Direction.Left },
            { dx: 0, dy: 1, dir: Direction.Down, oppositeDir: Direction.Up },
            { dx: -1, dy: 0, dir: Direction.Left, oppositeDir: Direction.Right }
        ];

        // Shuffle directions randomly
        const shuffledDirections = shuffleArray(directions);

        // Try each direction
        for (const {dx, dy, dir, oppositeDir} of shuffledDirections) {
            const nextX = x + (dx * config.corridorWidth);
            const nextY = y + (dy * config.corridorWidth);

            // Modified bounds check to properly handle corridor width
            if (nextX >= 0 && nextX + config.corridorWidth <= width && 
                nextY >= 0 && nextY + config.corridorWidth <= height && 
                !visited[nextY][nextX]) {
                
                // Remove the walls between current cell and next cell
                matrix.removeWall(x, y, dir);
                matrix.removeWall(nextX, nextY, oppositeDir);
                
                // Calculate the corridor area
                const corridorStartX = Math.min(x, nextX);
                const corridorStartY = Math.min(y, nextY);
                const corridorEndX = Math.max(x, nextX) + (config.corridorWidth - 1);
                const corridorEndY = Math.max(y, nextY) + (config.corridorWidth - 1);

                // Ensure corridor boundaries don't exceed matrix dimensions
                if (corridorEndX < width && corridorEndY < height) {
                    // Remove walls in the corridor area
                    removeWallsInArea(corridorStartX, corridorStartY, corridorEndX, corridorEndY);
                    
                    // Recursively visit next cell
                    generateMaze(nextX, nextY);
                }
            }
        }
    }

    function removeWallsInArea(startX: number, startY: number, endX: number, endY: number) {
        // Add bounds checking for safety
        if (startX < 0 || startY < 0 || endX >= width || endY >= height) {
            return; // Skip if out of bounds
        }

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                // Mark the cell as visited
                visited[y][x] = true;
                
                // Remove walls between adjacent cells in the corridor
                if (x < endX && x + 1 < width) {
                    matrix.removeWall(x, y, Direction.Right);
                    matrix.removeWall(x + 1, y, Direction.Left);
                }
                if (y < endY && y + 1 < height) {
                    matrix.removeWall(x, y, Direction.Down);
                    matrix.removeWall(x, y + 1, Direction.Up);
                }
            }
        }
    }

    function randomlyBreakWalls(percentage: number) {
        console.log('Breaking walls with percentage:', percentage);
        const totalWalls = (width - 2) * (height - 2) * 2; // Each cell has right and bottom walls
        const wallsToBreak = Math.floor(totalWalls * percentage);
        console.log('Number of walls to break:', wallsToBreak);
        
        let wallsBroken = 0;
        let attempts = 0;
        const maxAttempts = wallsToBreak * 3; // Allow for some failed attempts

        while (wallsBroken < wallsToBreak && attempts < maxAttempts) {
            // Pick a random cell (excluding borders)
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            
            // Pick a random direction (excluding walls that would break into borders)
            const possibleDirections = [];
            if (y > 1 && matrix.cells[y][x].walls[Direction.Up]) possibleDirections.push(Direction.Up);
            if (x < width - 2 && matrix.cells[y][x].walls[Direction.Right]) possibleDirections.push(Direction.Right);
            if (y < height - 2 && matrix.cells[y][x].walls[Direction.Down]) possibleDirections.push(Direction.Down);
            if (x > 1 && matrix.cells[y][x].walls[Direction.Left]) possibleDirections.push(Direction.Left);
            
            if (possibleDirections.length > 0) {
                const direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                
                // Remove the wall in the chosen direction
                matrix.removeWall(x, y, direction);
                
                // Remove the corresponding wall in the adjacent cell
                switch (direction) {
                    case Direction.Up:
                        matrix.removeWall(x, y - 1, Direction.Down);
                        break;
                    case Direction.Right:
                        matrix.removeWall(x + 1, y, Direction.Left);
                        break;
                    case Direction.Down:
                        matrix.removeWall(x, y + 1, Direction.Up);
                        break;
                    case Direction.Left:
                        matrix.removeWall(x - 1, y, Direction.Right);
                        break;
                }
                wallsBroken++;
                console.log('Broke wall at:', x, y, 'direction:', direction, 'total broken:', wallsBroken);
            }
            attempts++;
        }
        console.log('Final walls broken:', wallsBroken, 'after', attempts, 'attempts');
    }


} 