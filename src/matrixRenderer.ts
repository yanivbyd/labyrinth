import {Matrix} from './matrix';
import {Creature} from "./creature";
import {Cell, Food} from "./cell";
import {allDirections, Direction} from "./direction.js";

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
        for (const direction of allDirections) {
            if (cell.walls[direction]) {
                this.addWallToCell(cellDiv, direction);
            }
        }
        return cellDiv;
    }

    private addWallToCell(cellDiv: HTMLDivElement, direction: Direction): void {
        const wallDiv = document.createElement('div');
        wallDiv.style.position = 'absolute';
        wallDiv.style.backgroundColor = 'black';

        switch (direction) {
            case Direction.Up:
                wallDiv.style.top = '0';
                wallDiv.style.left = '0';
                wallDiv.style.right = '0';
                wallDiv.style.height = '1px';
                break;
            case Direction.Right:
                wallDiv.style.top = '0';
                wallDiv.style.right = '0';
                wallDiv.style.bottom = '0';
                wallDiv.style.width = '1px';
                break;
            case Direction.Down:
                wallDiv.style.bottom = '0';
                wallDiv.style.left = '0';
                wallDiv.style.right = '0';
                wallDiv.style.height = '1px';
                break;
            case Direction.Left:
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

    public removeFood(food: Food) {
        if (food.div) {
            if (food.div.parentElement) {
                food.div.parentElement.removeChild(food.div);
            }
            food.div = undefined;
        }
    }

    foodAdded(cell: Cell) {
        if (!cell.food) return;

        const foodDiv = document.createElement('div');
        foodDiv.classList.add('food');

        const size = this.cellSizePx * 0.4; // Reduced size
        const topOffset = cell.y * this.cellSizePx + (this.cellSizePx - size) / 2;
        const leftOffset = cell.x * this.cellSizePx + (this.cellSizePx - size) / 2;

        foodDiv.style.borderLeftWidth = `${size / 2}px`;
        foodDiv.style.borderRightWidth = `${size / 2}px`;
        foodDiv.style.borderBottomWidth = `${size}px`;

        const amountDiv = document.createElement('div');
        amountDiv.classList.add('food-amount');
        amountDiv.textContent = cell.food.amount.toString();
        foodDiv.appendChild(amountDiv);

        // Random rotation for variety
        const rotation = Math.random() * 60 - 30; // Random rotation between -30 and 30 degrees

        foodDiv.style.transform = `translate(${leftOffset}px, ${topOffset}px) rotate(${rotation}deg)`;

        this.creatureContainer?.appendChild(foodDiv);
        cell.food.div = foodDiv;
    }

    creatureDead(creature: Creature) {
        creature.div?.classList.add('dead');
    }
}