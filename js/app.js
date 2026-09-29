import {
    initializeSchemaCanvas
} from "./ui/schemaCanvas.js";
import {
    openDatabase 
} from "./db/database.js";

import {
    initializeDashboard
} from "./ui/dashboard.js";

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await openDatabase();

            console.log(
                "SchemaForge application initialized."
            );

            const currentPage =
            window.location.pathname
                .split("/")
                .pop();

            if (currentPage === "index.html" || currentPage === "") {

                initializeDashboard();

            }

            if (currentPage === "designer.html") {

                initializeSchemaCanvas();

            }

        } catch (error) {

            console.error(
                "Failed to initialize SchemaForge:",
                error
            );
        }
    }
);