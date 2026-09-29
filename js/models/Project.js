export class Project {

    constructor(
        name,
        description = ""
    ) {

        const now = Date.now();

        this.id = crypto.randomUUID();

        this.name = name;

        this.description = description;

        this.createdAt = now;

        this.updatedAt = now;
    }
}