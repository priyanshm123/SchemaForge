import { getDatabase } from "../db/database.js";

export function createColumn(column) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            "columns",
            "readwrite"
        );

        const store = transaction.objectStore("columns");

        const request = store.add(column);

        request.onsuccess = () => {
            resolve(column);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function getColumnByTable(tableId) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            "columns",
            "readonly"
        );

        const store = transaction.objectStore("columns");

        const index = store.index("tableId");

        const request = index.getAll(tableId);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function updateColumn(column) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            "columns",
            "readwrite"
        );

        const store = transaction.objectStore("columns");

        const request = store.put(column);

        request.onsuccess = () => {
            resolve(column);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function deleteColumn(columnId) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            "columns",
            "readwrite"
        );

        const store = transaction.objectStore("columns");

        const request = store.delete(columnId);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}