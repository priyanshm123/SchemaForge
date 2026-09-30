export class Table {

    constructor(
        projectId,
        name
    ) {
        const now = Date.now();

        this.id = crypto.randomUUID();

        this.projectId = projectId;

        this.name = name;

        this.position = {
            x: 100,
            y: 100
        };

        this.createdAt = now;
        this.updatedAt = now;
    }
}