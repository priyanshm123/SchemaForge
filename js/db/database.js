const DB_NAME = "SchemaForgeDB";
const DB_VERSION = 1;

let dbInstance = null;

export function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );


        request.onupgradeneeded = (event) => {

            const db = event.target.result;

            console.log(
                "Creating SchemaForge database..."
            );


            if (!db.objectStoreNames.contains("projects")) {

                const projectsStore =
                    db.createObjectStore(
                        "projects",
                        {
                            keyPath: "id"
                        }
                    );

                projectsStore.createIndex(
                    "name",
                    "name",
                    {
                        unique: false
                    }
                );
            }


            if (!db.objectStoreNames.contains("tables")) {

                const tablesStore =
                    db.createObjectStore(
                        "tables",
                        {
                            keyPath: "id"
                        }
                    );

                tablesStore.createIndex(
                    "projectId",
                    "projectId",
                    {
                        unique: false
                    }
                );
            }


            if (!db.objectStoreNames.contains("columns")) {

                const columnsStore =
                    db.createObjectStore(
                        "columns",
                        {
                            keyPath: "id"
                        }
                    );

                columnsStore.createIndex(
                    "tableId",
                    "tableId",
                    {
                        unique: false
                    }
                );
            }


            if (!db.objectStoreNames.contains("relationships")) {

                const relationshipsStore =
                    db.createObjectStore(
                        "relationships",
                        {
                            keyPath: "id"
                        }
                    );

                relationshipsStore.createIndex(
                    "projectId",
                    "projectId",
                    {
                        unique: false
                    }
                );
            }
        };


        request.onsuccess = (event) => {

            dbInstance = event.target.result;

            console.log(
                "SchemaForge IndexedDB connected."
            );

            resolve(dbInstance);
        };


        request.onerror = () => {

            console.error(
                "IndexedDB error:",
                request.error
            );

            reject(request.error);
        };
    });
}

export function getDatabase() {
    return dbInstance;
}