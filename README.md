# SchemaForge

**Offline Visual Database Designer**

## Project Description

SchemaForge is an offline, browser-based visual database schema designer that allows users to create, manage, and visualize database schemas directly in their web browser.

Users can create database projects, create and manage tables and columns, select data types, define primary and foreign keys, and establish relationships between tables. Tables can also be visually arranged on a schema canvas, with relationships displayed graphically.

---

## Goals

The main goals of SchemaForge are:

* Provide a simple and intuitive visual database schema designer.
* Allow users to create and manage database projects.
* Implement CRUD operations for tables and columns.
* Support common database data types.
* Support primary and foreign keys.
* Allow users to create relationships between tables.
* Visually represent tables and relationships.
* Allow tables to be dragged and arranged on the schema canvas.
* Persist schema data using IndexedDB.
* Use localStorage for UI preferences.
* Use cookies for appropriate temporary/session-related information.
* Provide search and filtering for tables and columns.
* Create a responsive interface for desktop, tablet, and mobile devices.
* Demonstrate important HTML, CSS, and JavaScript concepts.
* Deploy the finished application as a static website using GitHub Pages.

---

## Features

### Core Features

* **Project Management**

  * Create database projects
  * View existing projects
  * Edit project information
  * Delete projects

* **Table Management**

  * Create tables
  * Edit table names
  * Delete tables
  * Move tables on the visual canvas

* **Column Management**

  * Add columns
  * Edit columns
  * Delete columns
  * Select data types
  * Set nullable properties
  * Set default values

* **Keys and Constraints**

  * Define primary keys
  * Define foreign keys
  * Validate foreign-key references

* **Relationships**

  * Create relationships between tables
  * Display relationships graphically
  * Support common relationship types

* **Visual Schema Designer**

  * Visual table representation
  * Drag-and-drop table positioning
  * SVG-based relationship lines

* **Search and Filtering**

  * Search tables
  * Search columns
  * Filter schema elements

* **Browser Storage**

  * IndexedDB for schema data
  * localStorage for UI preferences
  * Cookies for temporary/session-related state

* **Responsive UI**

  * Desktop support
  * Tablet support
  * Mobile support
  * Glassmorphism-based interface

### Future Features

The following features may be implemented after the core application is stable:

* Zoom and pan
* Relationship highlighting
* Schema validation
* JSON import/export
* SQL `CREATE TABLE` generation
* Undo/redo
* Automatic table layout
* Additional relationship types

---

## Project Structure

```text
SchemaForge/
│
├── index.html
├── designer.html
├── README.md
├── LICENSE
│
├── css/
│   ├── style.css
│   ├── components.css
│   └── designer.css
│
├── js/
│   ├── app.js
│   │
│   ├── db/
│   │   └── database.js
│   │
│   ├── models/
│   │   ├── Project.js
│   │   ├── Table.js
│   │   ├── Column.js
│   │   └── Relationship.js
│   │
│   ├── services/
│   │   ├── projectService.js
│   │   ├── tableService.js
│   │   ├── columnService.js
│   │   └── relationshipService.js
│   │
│   ├── ui/
│   │   ├── dashboard.js
│   │   ├── tableEditor.js
│   │   ├── columnEditor.js
│   │   └── schemaCanvas.js
│   │
│   └── utils/
│       ├── helpers.js
│       └── storage.js
│
└── assets/
    └── screenshots/
```

### Directory Overview

| Directory/File  | Purpose                                   |
| --------------- | ----------------------------------------- |
| `index.html`    | Main dashboard page                       |
| `designer.html` | Visual schema designer page               |
| `css/`          | Application styling and responsive design |
| `js/app.js`     | Application initialization                |
| `js/db/`        | IndexedDB database layer                  |
| `js/models/`    | Data models                               |
| `js/services/`  | Application and CRUD operations           |
| `js/ui/`        | User-interface components                 |
| `js/utils/`     | Shared utility and storage functions      |
| `assets/`       | Project assets and screenshots            |
| `README.md`     | Project documentation                     |
| `LICENSE`       | MIT License                               |

---

## License

SchemaForge is licensed under the **MIT License**.

See the [`LICENSE`](LICENSE) file for the complete license text.

Copyright (c) 2026 SchemaForge
