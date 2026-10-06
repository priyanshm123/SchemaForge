import { getProjectById } from "../services/projectService.js";

import {
  createTable,
  getTablesByProject,
  updateTable,
  deleteTable,
} from "../services/tableService.js";

import { Table } from "../models/Table.js";

import { Column } from "../models/Column.js";

import {
  createColumn,
  getColumnByTable,
  updateColumn,
  deleteColumn,
} from "../services/columnService.js";

let currentColumnTableId = null;
let editingColumnId = null;
let editingTableId = null;

export async function initializeSchemaCanvas() {
  const projectId = localStorage.getItem("schemaforge.currentProject");

  if (!projectId) {
    showDesignerMessage("No project selected.");
    return;
  }

  try {
    const project = await getProjectById(projectId);

    if (!project) {
      showDesignerMessage("The selected project no longer exists.");
      return;
    }

    renderProjectHeader(project);

    const addTableButton = document.getElementById("add-table-button");

    addTableButton.addEventListener("click", () => {
      openTableModal(project.id);
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

    document
      .getElementById("close-table-modal")
      .addEventListener("click", closeTableModal);

    document
      .getElementById("cancel-table-modal")
      .addEventListener("click", closeTableModal);

    document
      .getElementById("table-form")
      .addEventListener("submit", handleTableFormSubmit);

    const foreignKeyCheckbox = document.getElementById("column-foreign-key");

    const foreignKeyFields = document.getElementById("foreign-key-fields");

    foreignKeyCheckbox.addEventListener("change", () => {
      foreignKeyFields.classList.toggle("hidden", !foreignKeyCheckbox.checked);
    });

    const foreignKeyTable = document.getElementById("foreign-key-table");

    foreignKeyTable.addEventListener("change", async () => {
      await loadForeignKeyColumns(foreignKeyTable.value);
    });

    await loadTables(project.id);
  } catch (error) {
    console.error("Failed to load project:", error);

    showDesignerMessage("Failed to load the project.");
  }
}

function renderProjectHeader(project) {
  const projectTitle = document.getElementById("project-title");

  const projectDescription = document.getElementById("project-description");

  if (projectTitle) {
    projectTitle.textContent = project.name;
  }

  if (projectDescription) {
    projectDescription.textContent = project.description;
  }
}

function showDesignerMessage(message) {
  const canvas = document.getElementById("schema-canvas");

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

  await renderTables(tables);
}

async function renderTables(tables) {
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

                <button
                    type="button"
                    class="add-column-button"
                    data-action="add-column"
                >
                    + Add Column
                </button>
            `;
    } else {
      columnsHTML = columns
        .map(
          (column) => `
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
                                <button
                                    type="button"
                                    class="edit-column-button"
                                    data-action="edit-column"
                                >
                                    ✎
                                </button>

                                <button
                                    type="button"
                                    class="delete-column-button"
                                    data-action="delete-column"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    `,
        )
        .join("");

      columnsHTML += `
                <button
                    type="button"
                    class="add-column-button"
                    data-action="add-column"
                >
                    + Add Column
                </button>
            `;
    }

    tableElement.innerHTML = `
            <div class="schema-table-header">
                <span>${table.name}</span>

                <div class="table-actions">
                    <button
                        type="button"
                        class="edit-table-button"
                        data-action="edit-table"
                    >
                        ✎
                    </button>

                    <button
                        type="button"
                        class="delete-table-button"
                        data-action="delete-table"
                    >
                        ×
                    </button>
                </div>
            </div>

            <div class="schema-table-body">
                ${columnsHTML}
            </div>
        `;

    const columnElements = tableElement.querySelectorAll(".schema-column");

    columnElements.forEach((columnElement, index) => {
      const column = columns[index];

      const editColumnButton = columnElement.querySelector(
        ".edit-column-button",
      );

      editColumnButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        handleEditColumn(column, columnElement);
      });

      const deleteColumnButton = columnElement.querySelector(
        ".delete-column-button",
      );

      deleteColumnButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        handleDeleteColumn(column.id);
      });
    });

    const editTableButton = tableElement.querySelector(".edit-table-button");

    editTableButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      openTableModal(table.projectId, table, tableElement);
    });

    const deleteTableButton = tableElement.querySelector(
      ".delete-table-button",
    );

    deleteTableButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      handleDeleteTable(table.id);
    });

    const addColumnButton = tableElement.querySelector(".add-column-button");

    addColumnButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      handleAddColumn(table.id);
    });

    canvas.appendChild(tableElement);
  }
}

function openTableModal(projectId, table = null, anchorElement = null) {
  const modal = document.getElementById("table-modal");

  const title = document.getElementById("table-modal-title");

  const nameInput = document.getElementById("table-name");

  const editor = modal.querySelector(".modal-content");

  if (table) {
    editingTableId = table.id;

    title.textContent = "Edit Table";
    nameInput.value = table.name;

    editor.classList.remove("table-create-editor");
    editor.classList.add("table-edit-editor");

    modal.classList.remove("hidden");

    if (anchorElement) {
      positionTableEditor(anchorElement);
    }
  } else {
    editingTableId = null;

    title.textContent = "Add Table";
    nameInput.value = "";

    editor.classList.remove("table-edit-editor");
    editor.classList.add("table-create-editor");

    editor.style.left = "50%";
    editor.style.top = "50%";
    editor.style.right = "auto";
    editor.style.transform = "translate(-50%, -50%)";

    modal.classList.remove("hidden");
  }

  nameInput.focus();
}

function positionTableEditor(anchorElement) {
  const modal = document.getElementById("table-modal");

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

  editor.style.transform = "none";
}

async function handleTableFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("table-name");

  const name = nameInput.value.trim();

  if (!name) {
    return;
  }

  try {
    const projectId = localStorage.getItem("schemaforge.currentProject");

    if (editingTableId) {
      const tables = await getTablesByProject(projectId);

      const table = tables.find((table) => table.id === editingTableId);

      if (!table) {
        return;
      }

      table.name = name;
      table.updatedAt = Date.now();

      await updateTable(table);
    } else {
      const tables = await getTablesByProject(projectId);

      const table = new Table(projectId, name);

      table.position = {
        x: 50 + (tables.length % 4) * 250,

        y: 50 + Math.floor(tables.length / 4) * 180,
      };

      await createTable(table);
    }

    closeTableModal();

    await loadTables(projectId);
  } catch (error) {
    console.error("Failed to save table:", error);
  }
}

function closeTableModal() {
  const modal = document.getElementById("table-modal");

  modal.classList.add("hidden");

  editingTableId = null;
}

async function handleDeleteTable(tableId) {
  const confirmed = confirm("Are you sure you want to delete this table?");

  if (!confirmed) {
    return;
  }

  await deleteTable(tableId);

  const projectId = localStorage.getItem("schemaforge.currentProject");

  await loadTables(projectId);
}

function handleAddColumn(tableId) {
  openColumnModal(tableId);
}

function handleEditColumn(column, columnElement) {
  openColumnModal(column.tableId, column, columnElement);
}

async function handleDeleteColumn(columnId) {
  const confirmed = confirm("Are you sure you want to delete this column?");

  if (!confirmed) {
    return;
  }

  await deleteColumn(columnId);

  const projectId = localStorage.getItem("schemaforge.currentProject");

  await loadTables(projectId);
}

async function openColumnModal(tableId, column = null, anchorElement = null) {
  const modal = document.getElementById("column-modal");

  const editor = modal.querySelector(".modal-content");

  editor.classList.add("column-editor");

  const tableModal = document.getElementById("table-modal");

  const title = document.getElementById("column-modal-title");

  const foreignKeyCheckbox = document.getElementById("column-foreign-key");

  const foreignKeyFields = document.getElementById("foreign-key-fields");

  foreignKeyCheckbox.checked = false;
  foreignKeyFields.classList.add("hidden");

  await loadForeignKeyTables();

  const nameInput = document.getElementById("column-name");

  const dataTypeInput = document.getElementById("column-data-type");

  const primaryKeyInput = document.getElementById("column-primary-key");

  const uniqueInput = document.getElementById("column-unique");

  const nullableInput = document.getElementById("column-nullable");

  const defaultInput = document.getElementById("column-default");

  tableModal.classList.add("hidden");

  editingTableId = null;

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
  } else {
    const editor = modal.querySelector(".modal-content");

    editor.style.left = "50%";
    editor.style.top = "50%";
    editor.style.right = "auto";

    editor.style.transform = "translate(-50%, -50%)";
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

  const maxTop = viewportHeight - editor.offsetHeight - 16;

  if (top > maxTop) {
    top = Math.max(16, maxTop);
  }
  
  editor.style.left = `${left}px`;

  editor.style.top = `${top}px`;

  editor.style.right = "auto";

  editor.style.transform = "none";
}

function closeColumnModal() {
  const modal = document.getElementById("column-modal");

  modal.classList.add("hidden");

  currentColumnTableId = null;

  editingColumnId = null;
}

async function handleColumnFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("column-name").value.trim();

  const dataType = document.getElementById("column-data-type").value;

  const primaryKey = document.getElementById("column-primary-key").checked;

  const unique = document.getElementById("column-unique").checked;

  const nullable = document.getElementById("column-nullable").checked;

  const defaultValue = document.getElementById("column-default").value.trim();

  if (!name) {
    return;
  }

  try {
    const columns = await getColumnByTable(currentColumnTableId);

    if (primaryKey) {
      const existingPrimaryKey = columns.find(
        (column) => column.primaryKey && column.id !== editingColumnId,
      );

      if (existingPrimaryKey) {
        alert("This table already has a primary key.");
        return;
      }
    }

    if (editingColumnId) {
      const columns = await getColumnByTable(currentColumnTableId);

      const column = columns.find((column) => column.id === editingColumnId);

      if (!column) {
        return;
      }

      column.name = name;

      column.dataType = dataType;

      column.primaryKey = primaryKey;
      column.unique = primaryKey ? true : unique;
      column.nullable = primaryKey ? false : nullable;

      column.defaultValue = defaultValue || null;

      await updateColumn(column);
    } else {
      const column = new Column(currentColumnTableId, name, dataType);

      column.primaryKey = primaryKey;

      column.unique = unique;

      column.nullable = nullable;

      column.defaultValue = defaultValue || null;

      await createColumn(column);
    }

    closeColumnModal();

    const projectId = localStorage.getItem("schemaforge.currentProject");

    await loadTables(projectId);
  } catch (error) {
    console.error("Failed to save column:", error);
  }
}

async function loadForeignKeyTables() {
  const projectId = localStorage.getItem("schemaforge.currentProject");

  const tables = await getTablesByProject(projectId);

  const tableSelect = document.getElementById("foreign-key-table");

  tableSelect.innerHTML = '<option value="">Select table</>';

  tables.forEach((table) => {
    const option = document.createElement("option");

    option.value = table.id;
    option.textContent = table.name;

    tableSelect.appendChild(option);
  });
}

async function loadForeignKeyColumns(tableId) {
  const columnSelect = document.getElementById("foreign-key-column");

  columnSelect.innerHTML = '<option value="">Select column</option>';

  if (!tableId) {
    return;
  }

  const columns = await getColumnByTable(tableId);

  columns.forEach((column) => {
    const option = document.createElement("option");

    option.value = column.id;
    option.textContent = `${column.name} (${column.dataType})`;

    columnSelect.appendChild(option);
  });
}
