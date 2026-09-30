import { getProjectById } from "../services/projectService.js";
import { createTable, getTablesByProject, updateTable, deleteTable } from "../services/tableService.js";
import { Table } from "../models/Table.js";
import { Column } from "../models/Column.js";
import { createColumn, getColumnByTable } from "../services/columnService.js";

export async function initializeSchemaCanvas() {

    const projectId = 
        localStorage.getItem(
            "schemaforge.currentProject"
        );

    if (!projectId) {

        showDesignerMessage(
            "No project selected."
        );

        return;
    }

    try {

        const project = await getProjectById(projectId);

        if (!project) {

            showDesignerMessage(
                "The selected project no longer exists."
            );

            return;
        }

        renderProjectHeader(project);

        const addTableButton = document.getElementById("add-table-button");

        addTableButton.addEventListener("click", () => {
            handleAddTable(project.id);
        });

        await loadTables(project.id);

    } catch (error) {
        
        console.error(
            "Failed to load project:",
            error 
        );

        showDesignerMessage(
            "Failed to load the projects."
        );
    }  
}

function renderProjectHeader(project) {

    const projectTitle =
        document.getElementById(
            "project-title"
        );

    const projectDescription =
        document.getElementById(
            "project-description"
        );


    if (projectTitle) {
        projectTitle.textContent =
            project.name;
    }


    if (projectDescription) {
        projectDescription.textContent =
            project.description;
    }
}

function showDesignerMessage(message) {

    const canvas =
        document.getElementById(
            "schema-canvas"
        );

    if (!canvas) {
        return;
    }

    canvas.innerHTML = `
        <div class="canvas-placeholder">
            <h2>${message}</h2>
        </div>
    `;
}

async function loadTables(projectId) {
    const tables = await getTablesByProject(projectId);

    renderTables(tables);
}

async  function renderTables(tables) {
    const canvas = document.getElementById("schema-canvas");

    canvas.innerHTML = "";

    if (tables.length === 0) {
        showDesignerMessage("No tables yet. Add your first table.");
        return;
    }

    for (const table of tables) {

        const columns = await getColumnByTable(table.id);
        const tableElement = document.createElement("div");

        tableElement.classList.add("schema-table");

        tableElement.style.left = `${table.position.x}px`;
        tableElement.style.top = `${table.position.y}px`;

        let columnsHTML = "";

        if (columns.length === 0) {

            columnsHTML = `
                <p class="no-column">
                    No columns yet
                </p>

                <button class="add-column-button">
                    + Add Column
                </button>
            `;
        } else {
            columnsHTML = columns.map((column) => `
                <div class="schema-column">
                    <span class="column-name">
                        ${column.name}
                    </span>

                    <span class="column-type">
                        ${column.dataType}
                    </span>
                </div>
            `).join("");

            columnsHTML += `
                <button class="add-column-button">
                    + Add Column
                </button>
            `
        }

        tableElement.innerHTML = `
            <div class="schema-table-header">
                <span>${table.name}</span>

                <div class="table-actions">
                    <button class="edit-table-button">
                        ✎
                    </button>

                    <button class="delete-table-button">
                        ×
                    </button>
                </div>
            </div>

            <div class="schema-table-body">
                ${columnsHTML}
            </div>
        `;

        const editButton =
            tableElement.querySelector(".edit-table-button");

        editButton.addEventListener("click", () => {
            handleEditTable(table);
        });

        const deleteButton = 
            tableElement.querySelector(".delete-table-button");
        
        deleteButton.addEventListener("click", () => {
            handleDeleteTable(table.id);
        });

        const addColumnButton =
            tableElement.querySelector(".add-column-button");

        addColumnButton.addEventListener("click", () => {
            handleAddColumn(table.id);
        });

        canvas.appendChild(tableElement);
    };
}

async function handleAddTable(projectId) {
    const name = prompt("Enter table name:");

    if (!name || !name.trim()) {
        return;
    }

    const tables = await getTablesByProject(projectId);

    const table = new Table(projectId, name.trim());

    table.position = {
        x: 50 + (tables.length % 4) * 250,
        y: 50 + Math.floor(tables.length / 4) * 180
    };

    await createTable(table);

    await loadTables(projectId);
}

async function handleDeleteTable(tableId) {
    const confirmed = confirm(
        "Are you sure you want to delete this table?"
    );

    if (!confirmed) {
        return;
    }

    await deleteTable(tableId);

    const projectId =
        localStorage.getItem("schemaforge.currentProject");

    await loadTables(projectId);
}

async function handleEditTable(table) {

    const newName = prompt(
        "Enter new table name:",
        table.name
    );

    if (!newName || !newName.trim()) {
        return;
    }

    table.name = newName.trim();

    await updateTable(table);

    await loadTables(table.projectId);
}

async function handleAddColumn(tableId) {
    const name = prompt("Enter column name:");

    if (!name || !name.trim()) {
        return;
    }

    const dataType = prompt(
        "Enter data type:",
        "VARCHAR"
    );

    if (!dataType || !dataType.trim()) {
        return;
    }

    const column = new Column(
        tableId,
        name.trim(),
        dataType.trim().toUpperCase()
    );

    await createColumn(column);

    const projectId = 
        localStorage.getItem("schemaforge.currentProject");
        
    await loadTables(projectId);
}