export class MatrixRenderer {
    constructor(containerId, cellSizePx) {
        var _a, _b;
        this.cellSizePx = cellSizePx;
        this.container = document.getElementById(containerId);
        this.cellContainer = ((_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('#cell-container')) || null;
        this.creatureContainer = ((_b = this.container) === null || _b === void 0 ? void 0 : _b.querySelector('#creature-container')) || null;
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
    render(matrix) {
        this.matrix = matrix;
        if (!this.cellContainer || !this.creatureContainer)
            return;
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
    createCreatureDiv(creature) {
        const creatureDiv = document.createElement('div');
        creatureDiv.classList.add('creature');
        creatureDiv.classList.add('creature_' + creature.type);
        creatureDiv.style.width = `${this.creatureSize}px`;
        creatureDiv.style.height = `${this.creatureSize}px`;
        creature.div = creatureDiv;
        this.updateCreaturePosition(creature);
        return creatureDiv;
    }
    createCellDiv(cell) {
        const cellDiv = document.createElement('div');
        cellDiv.style.width = `${this.cellSizePx}px`;
        cellDiv.style.height = `${this.cellSizePx}px`;
        cellDiv.style.border = '1px solid #fff';
        cellDiv.style.position = 'relative';
        // Add walls
        if (cell.walls.top)
            this.addWallToCell(cellDiv, 'top');
        if (cell.walls.right)
            this.addWallToCell(cellDiv, 'right');
        if (cell.walls.bottom)
            this.addWallToCell(cellDiv, 'bottom');
        if (cell.walls.left)
            this.addWallToCell(cellDiv, 'left');
        return cellDiv;
    }
    addWallToCell(cellDiv, direction) {
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
    updateCreaturePosition(creature) {
        if (creature.div) {
            const topOffset = creature.y * this.cellSizePx + (this.cellSizePx - this.creatureSize) / 2;
            const leftOffset = creature.x * this.cellSizePx + (this.cellSizePx - this.creatureSize) / 2;
            creature.div.style.transform = `translate(${leftOffset}px, ${topOffset}px)`;
        }
    }
    removeFood(food) {
        if (food.div) {
            if (food.div.parentElement) {
                food.div.parentElement.removeChild(food.div);
            }
            food.div = undefined;
        }
    }
    foodAdded(cell) {
        var _a;
        if (!cell.food)
            return;
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
        (_a = this.creatureContainer) === null || _a === void 0 ? void 0 : _a.appendChild(foodDiv);
        cell.food.div = foodDiv;
    }
    creatureDead(creature) {
        var _a;
        (_a = creature.div) === null || _a === void 0 ? void 0 : _a.classList.add('dead');
    }
}
