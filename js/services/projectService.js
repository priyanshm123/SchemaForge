import { getDatabase } from "../db/database.js";

export function createProject(project) {

    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            ["projects"],
            "readwrite"
        );

        const store = transaction.objectStore(
            "projects"
        );

        const request = store.add(project);

        request.onsuccess = () => {
            resolve(project);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function getProjects() {

    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            ["projects"],
            "readonly" 
        );

        const store = transaction.objectStore(
            "projects"
        );

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function deleteProject(projectId) {

    return new Promise((resolve, reject) => {
        const db = getDatabase();

        const transaction = db.transaction(
            ["projects"],
            "readwrite"
        );

        const store = transaction.objectStore(
            "projects"
        );

        const request = store.delete(projectId);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function getProjectById(projectId) {
    
    return new Promise((resolve, reject) => {

        const db = getDatabase();

        const transaction = db.transaction(
            ["projects"],
            "readonly"
        );

        const store = transaction.objectStore(
            "projects"
        );

        const request = store.get(projectId);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}