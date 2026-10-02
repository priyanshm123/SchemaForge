import { getDatabase } from "../db/database.js";

export function createTable(table) {

    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            ["tables"],
            "readwrite"
        );

        const store = 
            transaction.objectStore("tables");

        const request = store.add(table);

        request.onsuccess = () => {
            resolve(table);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function getTablesByProject(projectId) {

    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            ["tables"],
            "readonly"
        );

        const store = 
            transaction.objectStore("tables");

        const index = 
            store.index("projectId");
        
        const request = 
            index.getAll(projectId);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function updateTable(table) {
    return new Promise((resolve, reject) => {
        try {
            const db = getDatabase();

            const transaction = db.transaction(
                ["tables"],
                "readwrite"
            );

            const store = transaction.objectStore("tables");

            console.log("Updating table:", table);

            const request = store.put(table);

            request.onsuccess = () => {
                console.log("Table updated:", request.result);
                resolve(table);
            };

            request.onerror = () => {
                console.error(
                    "Failed to update table:",
                    request.error
                );

                reject(request.error);
            };

            transaction.onerror = () => {
                console.error(
                    "Table transaction failed:",
                    transaction.error
                );

                reject(transaction.error);
            };

            transaction.onabort = () => {
                console.error(
                    "Table transaction aborted:",
                    transaction.error
                );

                reject(transaction.error);
            };

        } catch (error) {
            console.error("updateTable crashed:", error);
            reject(error);
        }
    });
}

export function deleteTable(tableId) {

    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            ["tables"],
            "readwrite"
        );

        const store = 
            transaction.objectStore("tables");
        
        const request = 
            store.delete(tableId);
        
        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}