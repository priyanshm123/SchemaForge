import { getProjectById } from "../services/projectService.js";
import { getColumnByTable } from "../services/columnService.js";
import { getTablesByProject } from "../services/tableService.js";

import {
  deleteColumnFromEditor,
  initializeColumnEditor,
  openColumnEditor,
} from "./columnEditor.js";

import {
  deleteTableFromEditor,
  initializeTableEditor,
  openTableEditor,
} from "./tableEditor.js";

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

    const refreshCanvas = () => loadTables(project.id);
    initializeColumnEditor(refreshCanvas);
    initializeTableEditor(refreshCanvas);

    document
      .getElementById("add-table-button")
      .addEventListener("click", () => {
        openTableEditor(project.id);
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
        openColumnEditor(column.tableId, column, columnElement);
      });

      const deleteColumnButton = columnElement.querySelector(
        ".delete-column-button",
      );

      deleteColumnButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        deleteColumnFromEditor(column.id);
      });
    });

    const editTableButton = tableElement.querySelector(".edit-table-button");

    editTableButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openTableEditor(table.projectId, table, tableElement);
    });

    const deleteTableButton = tableElement.querySelector(
      ".delete-table-button",
    );

    deleteTableButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteTableFromEditor(table.id);
    });

    const addColumnButton = tableElement.querySelector(".add-column-button");

    addColumnButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openColumnEditor(table.id);
    });

    canvas.appendChild(tableElement);
  }
}
