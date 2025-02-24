import {Matrix, Cell, Creature} from './matrix';

export class MatrixRenderer {
    private matrix: Matrix | null;
    private container: HTMLElement | null;
    private cellSizePx: number;
    private creatureSize: number;

    constructor(containerId: string, cellSizePx: number) {
        this.cellSizePx = cellSizePx;
        this.container = document.getElementById(containerId);
        this.matrix = null;
        this.creatureSize = Math.max(Math.floor(this.cellSizePx * 0.6), 2); // 60% of cell size, minimum 2px
    }

    render(matrix: Matrix): void {
        this.matrix = matrix;
        if (!this.container) return;

        this.container.innerHTML = '';
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = `repeat(${this.matrix.width}, ${this.cellSizePx}px)`;
        this.container.style.gridTemplateRows = `repeat(${this.matrix.height}, ${this.cellSizePx}px)`;

        for (let y = 0; y < this.matrix.height; y++) {
            for (let x = 0; x < this.matrix.width; x++) {
                const cell = this.matrix.getCell(x, y);
                if (cell) {
                    const cellDiv = this.createCellDiv(cell);
                    this.container.appendChild(cellDiv);
                }
            }
        }
    }

    private createCellDiv(cell: Cell): HTMLDivElement {
        const cellDiv: HTMLDivElement = document.createElement('div');
        cellDiv.style.width = `${this.cellSizePx}px`;
        cellDiv.style.height = `${this.cellSizePx}px`;
        cellDiv.style.border = '1px solid #fff';
        cellDiv.style.position = 'relative';

        // Add walls
        if (cell.walls.top) this.addWallToCell(cellDiv, 'top');
        if (cell.walls.right) this.addWallToCell(cellDiv, 'right');
        if (cell.walls.bottom) this.addWallToCell(cellDiv, 'bottom');
        if (cell.walls.left) this.addWallToCell(cellDiv, 'left');

        // Add creature
        if (cell.creature) {
            const creatureDiv = document.createElement('div');
            creatureDiv.style.width = `${this.creatureSize}px`;
            creatureDiv.style.height = `${this.creatureSize}px`;
            creatureDiv.style.borderRadius = '50%';
            creatureDiv.style.backgroundColor = 'red';
            creatureDiv.style.position = 'absolute';
            cellDiv.appendChild(creatureDiv);
            cell.creature.div = creatureDiv;
            this.creatureMoved(cell.creature);
        }

        return cellDiv;
    }

    private addWallToCell(cellDiv: HTMLDivElement, direction: 'top' | 'right' | 'bottom' | 'left'): void {
        const wallDiv = document.createElement('div');
        wallDiv.style.position = 'absolute';
        wallDiv.style.backgroundColor = 'black';

        switch (direction) {
            case 'top':
                wallDiv.style.top = '0';
                wallDiv.style.left = '0';
                wallDiv.style.right = '0';
                wallDiv.style.height = '1px';
                break;
            case 'right':
                wallDiv.style.top = '0';
                wallDiv.style.right = '0';
                wallDiv.style.bottom = '0';
                wallDiv.style.width = '1px';
                break;
            case 'bottom':
                wallDiv.style.bottom = '0';
                wallDiv.style.left = '0';
                wallDiv.style.right = '0';
                wallDiv.style.height = '1px';
                break;
            case 'left':
                wallDiv.style.top = '0';
                wallDiv.style.left = '0';
                wallDiv.style.bottom = '0';
                wallDiv.style.width = '1px';
                break;
        }

        cellDiv.appendChild(wallDiv);
    }

    public creatureMoved(creature: Creature) {
        if (creature.div == null) {
            return;
        }
        creature.div.style.top = `${Math.floor((this.cellSizePx - this.creatureSize) / 2)}px`;
        creature.div.style.left = `${Math.floor((this.cellSizePx - this.creatureSize) / 2)}px`;
    }
}