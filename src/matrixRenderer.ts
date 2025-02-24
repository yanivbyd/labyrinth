import {Matrix, Cell} from './matrix';
import {Creature} from "./creature";

export class MatrixRenderer {
    private matrix: Matrix | null;
    private container: HTMLElement | null;
    private cellContainer: HTMLElement | null;
    private creatureContainer: HTMLElement | null;
    private cellSizePx: number;
    private creatureSize: number;

    constructor(containerId: string, cellSizePx: number) {
        this.cellSizePx = cellSizePx;
        this.container = document.getElementById(containerId);
        this.cellContainer = this.container?.querySelector('#cell-container') || null;
        this.creatureContainer = this.container?.querySelector('#creature-container') || null;
        this.matrix = null;
        this.creatureSize = Math.max(Math.floor(this.cellSizePx * 0.6), 2);

        if (this.cellContainer && this.creatureContainer && this.container) {
            this.container.style.position = 'relative';
            this.cellContainer.style.position = 'relative';
            this.creatureContainer.style.position = 'absolute';
            this.creatureContainer.style.top = '0';
            this.creatureContainer.style.left = '0';
            this.creatureContainer.style.width = '100%';
            this.creatureContainer.style.height = '100%';
        }
    }

    render(matrix: Matrix): void {
        this.matrix = matrix;
        if (!this.cellContainer || !this.creatureContainer) return;

        this.cellContainer.innerHTML = '';
        this.creatureContainer.innerHTML = '';
        this.cellContainer.style.display = 'grid';
        this.cellContainer.style.gridTemplateColumns = `repeat(${this.matrix.width}, ${this.cellSizePx}px)`;
        this.cellContainer.style.gridTemplateRows = `repeat(${this.matrix.height}, ${this.cellSizePx}px)`;

        for (let y = 0; y < this.matrix.height; y++) {
            for (let x = 0; x < this.matrix.width; x++) {
                const cell = this.matrix.getCell(x, y);
                if (cell != null) {
                    this.cellContainer.appendChild(this.createCellDiv(cell));
                }
                if (cell != null && cell.creature != null) {
                    this.creatureContainer.appendChild(this.createCreatureDiv(cell.creature));
                }
            }
        }
    }

    private createCreatureDiv(creature: Creature): HTMLDivElement {
        const creatureDiv = document.createElement('div');
        creatureDiv.classList.add('creature');
        creatureDiv.classList.add('creature_'+creature.type);
        creatureDiv.style.width = `${this.creatureSize}px`;
        creatureDiv.style.height = `${this.creatureSize}px`;
        creature.div = creatureDiv;
        this.updateCreaturePosition(creature);
        return creatureDiv;
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

    public updateCreaturePosition(creature: Creature) {
        if (creature.div ) {
            const topOffset = creature.y * this.cellSizePx + (this.cellSizePx - this.creatureSize) / 2;
            const leftOffset = creature.x * this.cellSizePx + (this.cellSizePx - this.creatureSize) / 2;

            creature.div.style.transform = `translate(${leftOffset}px, ${topOffset}px)`;
        }
    }
}