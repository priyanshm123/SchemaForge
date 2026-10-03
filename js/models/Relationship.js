export class Relationship {
    constructor(
        projectId,
        fromTableId,
        fromColumnId,
        toTableId,
        toColumnId, 
        type = "many-to-one"
    ) {
        this.id = crypto.randomUUID();
        this.projectId = projectId;
        this.fromTableId = fromTableId;
        this.fromColumnId = fromColumnId;
        this.toTableId = toTableId;
        this.toColumnId = toColumnId;
        this.type = type;
        this.createdAt = Date.now();
    }
}