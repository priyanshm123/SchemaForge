import { Table } from "../models/Table.js";

import {
  createTable,
  getTablesByProject,
  updateTable,
  deleteTable,
} from "../services/tableService.js";

let editingTableId = null;
let refreshCanvas = () => {};

export function initializeTableEditor(onChange) {
  refreshCanvas = onChange;

  document
    .getElementById("close-table-modal")
    .addEventListener("click", closeTableEditor);

  document
    .getElementById("cancel-table-modal")
    .addEventListener("click", closeTableEditor);

  document
    .getElementById("table-form")
    .addEventListener("submit", handleTableFormSubmit);
}

export function openTableEditor(projectId, table = null, anchorElement = null) {
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
    const tables = await getTablesByProject(projectId);

    if (editingTableId) {
      const table = tables.find((item) => item.id === editingTableId);

      if (!table) {
        return;
      }

      table.name = name;
      table.updatedAt = Date.now();

      await updateTable(table);
    } else {
      const table = new Table(projectId, name);

      table.position = {
        x: 50 + (tables.length % 4) * 250,
        y: 50 + Math.floor(tables.length / 4) * 180,
      };

      await createTable(table);
    }

    closeTableEditor();
    refreshCanvas(projectId);
  } catch (error) {
    console.error("Failed to save table:", error);
  }
}

export function closeTableEditor() {
  const modal = document.getElementById("table-modal");

  modal.classList.add("hidden");
  editingTableId = null;
}

export async function deleteTableFromEditor(tableId) {
  const confirmed = confirm("Are you sure you want to delete this table?");

  if (!confirmed) {
    return;
  }

  await deleteTable(tableId);
  refreshCanvas(localStorage.getItem("schemaforge.currentProject"));
}