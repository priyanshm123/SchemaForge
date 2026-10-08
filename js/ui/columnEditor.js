import { Column } from "../models/Column.js";

import {
  createColumn,
  getColumnByTable,
  updateColumn,
  deleteColumn,
} from "../services/columnService.js";

import { getTablesByProject } from "../services/tableService.js";

import { closeTableEditor } from "./tableEditor.js";

let currentColumnTableId = null;
let editingColumnId = null;
let refreshCanvas = () => {};

export function initializeColumnEditor(onChange) {
  refreshCanvas = onChange;

  document
    .getElementById("close-column-modal")
    .addEventListener("click", closeColumnEditor);

  document
    .getElementById("cancel-column-modal")
    .addEventListener("click", closeColumnEditor);

  document
    .getElementById("column-form")
    .addEventListener("submit", handleColumnFormSubmit);

  const foreignKeyCheckbox = document.getElementById("column-foreign-key");
  const foreignKeyFields = document.getElementById("foreign-key-fields");

  foreignKeyCheckbox.addEventListener("change", () => {
    foreignKeyFields.classList.toggle("hidden", !foreignKeyCheckbox.checked);
  });

  const foreignKeyTable = document.getElementById("foreign-key-table");

  foreignKeyTable.addEventListener("change", async () => {
    await loadForeignKeyColumns(foreignKeyTable.value);
  });
}

export async function openColumnEditor(
  tableId,
  column = null,
  anchorElement = null,
) {
  const modal = document.getElementById("column-modal");
  const editor = modal.querySelector(".modal-content");
  const title = document.getElementById("column-modal-title");
  const foreignKeyCheckbox = document.getElementById("column-foreign-key");
  const foreignKeyFields = document.getElementById("foreign-key-fields");

  editor.classList.add("column-editor");
  foreignKeyCheckbox.checked = false;
  foreignKeyFields.classList.add("hidden");
  await loadForeignKeyTables();

  const nameInput = document.getElementById("column-name");
  const dataTypeInput = document.getElementById("column-data-type");
  const primaryKeyInput = document.getElementById("column-primary-key");
  const uniqueInput = document.getElementById("column-unique");
  const nullableInput = document.getElementById("column-nullable");
  const defaultInput = document.getElementById("column-default");

  closeTableEditor();
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

function closeColumnEditor() {
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
      const column = columns.find((item) => item.id === editingColumnId);

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

    closeColumnEditor();
    await refreshCanvas(localStorage.getItem("schemaforge.currentProject"));
  } catch (error) {
    console.error("Failed to save column:", error);
  }
}

export async function deleteColumnFromEditor(columnId) {
  const confirmed = confirm("Are you sure you want to delete this column?");

  if (!confirmed) {
    return;
  }

  await deleteColumn(columnId);
  await refreshCanvas(localStorage.getItem("schemaforge.currentProject"));
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