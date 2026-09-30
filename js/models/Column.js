export class Column {

    constructor( tableId, name, dataType = "VARCHAR") {

        this.id = crypto.randomUUID();

        this.tableId = tableId;

        this.name = name;

        this.dataType = dataType;

        this.nullable = true;

        this.primaryKey = false;

        this.unique = false;

        this.defaultValue = null;
    }
}