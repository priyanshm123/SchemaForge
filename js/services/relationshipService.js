import { getDatabase } from "../db/database.js";

export function createRelationship(relationship) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const transaction = db.transaction(
            "relationships",
            "readwrite"
        );
        const store =
            transaction.objectStore("relationships");

        const request = store.add(relationship);

        request.onsuccess = () => {
            resolve(relationship);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function getRelationshipsByProject(projectId) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const transaction = db.transaction(
            "relationships",
            "readonly"
        );
        const store =
            transaction.objectStore("relationships");

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

export function getRelationshipById(relationshipId) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const transaction = db.transaction(
            "relationships",
            "readonly"
        );
        const store =
            transaction.objectStore("relationships");

        const request =
            store.get(relationshipId);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function updateRelationship(relationship) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const transaction = db.transaction(
            "relationships",
            "readwrite"
        );
        const store =
            transaction.objectStore("relationships");

        const request =
            store.put(relationship);

        request.onsuccess = () => {
            resolve(relationship);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function deleteRelationship(relationshipId) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const transaction = db.transaction(
            "relationships",
            "readwrite"
        );
        const store =
            transaction.objectStore("relationships");

        const request =
            store.delete(relationshipId);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}