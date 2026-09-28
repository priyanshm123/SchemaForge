document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await openDatabase();

            console.log(
                "SchemaForge application initialized."
            );

        } catch (error) {

            console.error(
                "Failed to initialize SchemaForge:",
                error
            );
        }
    }
);