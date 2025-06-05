// creatureTable.ts
export class CreatureTable {
    constructor() {
        this.createTable();
    }
    static getInstance() {
        if (!CreatureTable.instance) {
            CreatureTable.instance = new CreatureTable();
        }
        return CreatureTable.instance;
    }
    createTable() {
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
        this.tableBody = table.querySelector('tbody');
        const container = document.createElement('div');
        container.className = 'table-container';
        container.appendChild(table);
        document.body.appendChild(container);
    }
    addCreature(creature) {
        const row = document.createElement('tr');
        row.id = `creature-${creature.id}`;
        this.updateCreatureRow(row, creature);
        if (this.tableBody)
            this.tableBody.appendChild(row);
    }
    updateCreature(creature) {
        const row = document.getElementById(`creature-${creature.id}`);
        if (row) {
            this.updateCreatureRow(row, creature);
        }
    }
    updateCreatureRow(row, creature) {
        row.innerHTML = `
            <td><div class="creature-ball creature_${creature.type}"></div></td>
            <td>${creature.health}</td>
            <td>+${creature.battlesWon}  -${creature.battlesLost}</td>
        `;
    }
}
