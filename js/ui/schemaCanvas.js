import { getProjectById } from "../services/projectService.js";
import { createTable, getTablesByProject, updateTable, deleteTable } from "../services/tableService.js";
import { Table } from "../models/Table.js";
import { Column } from "../models/Column.js";
import { createColumn, getColumnByTable, updateColumn, deleteColumn } from "../services/columnService.js";

let currentColumnTableId = null;
let editingColumnId = null;

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

        document
            .getElementById("close-column-modal")
            .addEventListener("click", closeColumnModal);

        document
            .getElementById("cancel-column-modal")
            .addEventListener("click", closeColumnModal);

        document
            .getElementById("column-form")
            .addEventListener("submit", handleColumnFormSubmit);

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
                <p class="no-columns">
                    No columns yet
                </p>

                <button class="add-column-button">
                    + Add Column
                </button>
            `;
        } else {
            columnsHTML = columns.map((column) => `
                <div class="schema-column">
                    <div class="column-info">
                        <span class="column-name">
                            ${column.name}
                        </span>

                        <span class="column-type">
                            ${column.dataType}
                        </span>
                    </div>

                    <div class="column-actions">
                        <button class="edit-column-button">
                            ✎
                        </button>

                        <button class="delete-column-button">
                            ×
                        </button>
                    </div>
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

        const columnElements =
            tableElement.querySelectorAll(".schema-column");

        columnElements.forEach((columnElement, index) => {

            const column = columns[index];

            const editButton =
                columnElement.querySelector(".edit-column-button");

            editButton.addEventListener("click", () => {
                handleEditColumn(column, columnElement);
            });

            const deleteButton =
                columnElement.querySelector(".delete-column-button");

            deleteButton.addEventListener("click", () => {
                handleDeleteColumn(column.id, table.id);
            });
        });

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
   openColumnModal(tableId);
}

async function handleEditColumn(column, columnElement) {
   openColumnModal(column.tableId, column, columnElement);
}

async function handleDeleteColumn(columnId, tableId) {
    const confirmed = confirm(
        "Are you sure you want to delete this column?"
    );

    if (!confirmed) {
        return;
    }

    await deleteColumn(columnId);

    const projectId =
        localStorage.getItem("schemaforge.currentProject");

    await loadTables(projectId);
}

function openColumnModal(tableId, column = null, anchorElement = null) {
    const modal = document.getElementById("column-modal");
    const title = document.getElementById("column-modal-title");

    const nameInput = document.getElementById("column-name");
    const dataTypeInput = document.getElementById("column-data-type");
    const primaryKeyInput = document.getElementById("column-primary-key");
    const uniqueInput = document.getElementById("column-unique");
    const nullableInput = document.getElementById("column-nullable");
    const defaultInput = document.getElementById("column-default");

    currentColumnTableId = tableId;

    if (column) {
        editingColumnId = column.id;

        title.textContent = "Edit Column";

        nameInput.value = column.name;
        dataTypeInput.value = column.dataType;
        primaryKeyInput.checked = column.primaryKey;
        uniqueInput.checked = column.unique;
        nullableInput.checked = column.nullable;
        defaultInput.value = column.defaultValue ?? "";
    } else {
        editingColumnId = null;

        title.textContent = "Add Column";

        nameInput.value = "";
        dataTypeInput.value = "VARCHAR";
        primaryKeyInput.checked = false;
        uniqueInput.checked = false;
        nullableInput.checked = true;
        defaultInput.value = "";
    }

    modal.classList.remove("hidden");

    if (anchorElement) {
    positionColumnEditor(anchorElement);
    }

    nameInput.focus();
}

function positionColumnEditor(anchorElement) {
    const modal = document.getElementById("column-modal");
    const editor = modal.querySelector(".modal-content");

    const rect = anchorElement.getBoundingClientRect();

    const gap = 12;

    let left = rect.right + gap;
    let top = rect.top;

    const editorWidth = editor.offsetWidth;
    const editorHeight = editor.offsetHeight;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + editorWidth > viewportWidth - 16) {
        left = rect.left - editorWidth - gap;
    }

    if (top + editorHeight > viewportHeight - 16) {
        top = viewportHeight - editorHeight - 16;
    }

    if (top < 16) {
        top = 16;
    }

    editor.style.left = `${left}px`;
    editor.style.top = `${top}px`;
    editor.style.right = "auto";
}

function closeColumnModal() {
    const modal = document.getElementById("column-modal");

    modal.classList.add("hidden");

    currentColumnTableId = null;
    editingColumnId = null;
}

async function handleColumnFormSubmit(event) {
    event.preventDefault();

    const name = document
        .getElementById("column-name")
        .value
        .trim();

    const dataType =
        document.getElementById("column-data-type").value;

    const primaryKey =
        document.getElementById("column-primary-key").checked;

    const unique =
        document.getElementById("column-unique").checked;

    const nullable =
        document.getElementById("column-nullable").checked;

    const defaultValue =
        document.getElementById("column-default").value.trim();

    if (!name) {
        return;
    }

    try {
        if (editingColumnId) {

            const columns =
                await getColumnByTable(currentColumnTableId);

            const column =
                columns.find(
                    (column) =>
                        column.id === editingColumnId
                );

            if (!column) {
                return;
            }

            column.name = name;
            column.dataType = dataType;
            column.primaryKey = primaryKey;
            column.unique = unique;
            column.nullable = nullable;
            column.defaultValue =
                defaultValue || null;

            await updateColumn(column);

        } else {

            const column = new Column(
                currentColumnTableId,
                name,
                dataType
            );

            column.primaryKey = primaryKey;
            column.unique = unique;
            column.nullable = nullable;
            column.defaultValue =
                defaultValue || null;

            await createColumn(column);
        }

        closeColumnModal();

        const projectId =
            localStorage.getItem(
                "schemaforge.currentProject"
            );

        await loadTables(projectId);

    } catch (error) {
        console.error(
            "Failed to save column:",
            error
        );
    }
}