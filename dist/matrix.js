export { Cell, Creature, Matrix };
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = {
            top: false,
            right: false,
            bottom: false,
            left: false,
        };
        this.creature = null;
    }
}
class Creature {
    constructor(id) {
        this.id = id;
        this.div = null;
    }
}
class Matrix {
    constructor(width, height, renderer) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.renderer = renderer;
        for (let y = 0; y < height; y++) {
            this.cells[y] = [];
            for (let x = 0; x < width; x++) {
                this.cells[y][x] = new Cell(x, y);
            }
        }
    }
    getCell(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.cells[y][x];
        }
        return null;
    }
    addWall(x, y, direction) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.walls[direction] = true;
            // Add wall to adjacent cell
            let adjacentCell = null;
            switch (direction) {
                case 'top':
                    adjacentCell = this.getCell(x, y - 1);
                    if (adjacentCell)
                        adjacentCell.walls.bottom = true;
                    break;
                case 'right':
                    adjacentCell = this.getCell(x + 1, y);
                    if (adjacentCell)
                        adjacentCell.walls.left = true;
                    break;
                case 'bottom':
                    adjacentCell = this.getCell(x, y + 1);
                    if (adjacentCell)
                        adjacentCell.walls.top = true;
                    break;
                case 'left':
                    adjacentCell = this.getCell(x - 1, y);
                    if (adjacentCell)
                        adjacentCell.walls.right = true;
                    break;
            }
        }
    }
    addCreature(creature, x, y) {
        const cell = this.getCell(x, y);
        if (cell && !cell.creature) {
            cell.creature = creature;
            return true;
        }
        return false;
    }
    moveCreature(fromX, fromY, toX, toY) {
        const fromCell = this.getCell(fromX, fromY);
        const toCell = this.getCell(toX, toY);
        if (fromCell && toCell && fromCell.creature && !toCell.creature) {
            // Check if there's a wall between the cells
            if ((fromX === toX && Math.abs(fromY - toY) === 1 && !fromCell.walls[fromY < toY ? 'bottom' : 'top']) ||
                (fromY === toY && Math.abs(fromX - toX) === 1 && !fromCell.walls[fromX < toX ? 'right' : 'left'])) {
                toCell.creature = fromCell.creature;
                fromCell.creature = null;
                this.renderer.creatureMoved(toCell.creature);
                return true;
            }
        }
        return false;
    }
}
