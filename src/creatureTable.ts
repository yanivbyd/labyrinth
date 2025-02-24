// creatureTable.ts

import { Creature } from './creature';

export class CreatureTable {
    private tableBody: HTMLTableSectionElement | undefined;
    private static instance: CreatureTable;

    private constructor() {
        this.createTable();
    }

    static getInstance(): CreatureTable {
        if (!CreatureTable.instance) {
            CreatureTable.instance = new CreatureTable();
        }
        return CreatureTable.instance;
    }

    private createTable() {
        const table = document.createElement('table');
        table.className = 'creature-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Visual</th>
                    <th>Health</th>
                    <th>Battles (win,lose)</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        this.tableBody = table.querySelector('tbody')!;

        const container = document.createElement('div');
        container.className = 'table-container';
        container.appendChild(table);

        document.body.appendChild(container);
    }

    addCreature(creature: Creature) {
        const row = document.createElement('tr');
        row.id = `creature-${creature.id}`;
        this.updateCreatureRow(row, creature);
        if (this.tableBody) this.tableBody.appendChild(row);
    }

    updateCreature(creature: Creature) {
        const row = document.getElementById(`creature-${creature.id}`);
        if (row) {
            this.updateCreatureRow(row, creature);
        }
    }

    private updateCreatureRow(row: HTMLElement, creature: Creature) {
        row.innerHTML = `
            <td><div class="creature-ball creature_${creature.type}"></div></td>
            <td>${creature.health}</td>
            <td>+${creature.battlesWon}  -${creature.battlesLost}</td>
        `;
    }
}