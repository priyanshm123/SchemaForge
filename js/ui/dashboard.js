import {
    createProject,
    getProjects,
    deleteProject
} from "../services/projectService.js"

import { Project } from "../models/Project.js";

const projectList = 
    document.getElementById("project-list");

async function loadProjects() {

    try {
        const projects = await getProjects();

        renderProjects(projects);

    } catch (error) {

        console.error(
            "Failed to load projects:", 
            error
        );
    }
}

function renderProjects(projects) {

    projectList.innerHTML = "";

    if (projects.length === 0) {

        projectList.innerHTML = `
            <div class="empty-state glass-panel">

                <div class="empty-icon">
                    +
                </div>

                <h3>No projects yet</h3>

                <p>
                    Create your first database schema to get started.
                </p>

                <button
                    id="empty-create-project-btn"
                    class="primary-button"
                >
                    Create Project
                </button>

            </div>
        `;

        attachCreateProjectButton();

        return;
    }

    projects.forEach(project => {

        const projectCard = document.createElement("div");

        projectCard.className = "project-card glass-panel";

         projectCard.innerHTML = `
            <h3>${project.name}</h3>

            <p>
                ${project.description || "No description"}
            </p>

            <div class="project-actions">

                <button
                    class="primary-button open-project"
                    data-id="${project.id}"
                >
                    Open
                </button>

                <button
                    class="delete-button"
                    data-id="${project.id}"
                >
                    Delete
                </button>

            </div>
        `;

        projectList.append(projectCard);
    });

    attachProjectActions();
}

function attachCreateProjectButton() {

    const buttons = [
        document.getElementById("create-project-btn"),
        document.getElementById("empty-create-project-btn")
    ];

    buttons.forEach(button => {

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            handleCreateProject
        );
    });
}

async function handleCreateProject() {

    const name = prompt(
        "Enter project name:"
    );

    if (!name || !name.trim()) {
        return;
    }

    const description = prompt(
        "Enter project description:"
    );

    const now = Date.now();

    const project = new Project(
        name.trim(),
        description?.trim() || ""
    );

    try {
        await createProject(project);

        await loadProjects();
    } catch (error) {

        console.error(
            "Failed to create project:",
            error
        );

        alert(
            "Could not create the project."
        );
    } 
}

function attachProjectActions() {

    const openButtons = 
        document.querySelectorAll(
            ".open-project"
        );
    
    const deleteButtons = 
        document.querySelectorAll(
            ".delete-button"
        );
    
    openButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const projectId = 
                    button.dataset.id;
                
                localStorage.setItem(
                    "schemaforge.currentProject",
                    projectId
                );

                window.location.href = 
                    "designer.html";
            }
        );
    });

    deleteButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const projectId =
                    button.dataset.id;

                const confirmed =
                    confirm(
                        "Delete this project?"
                    );

                if (!confirmed) {
                    return;
                }

                try {

                    await deleteProject(
                        projectId
                    );

                    await loadProjects();

                } catch (error) {

                    console.error(
                        "Failed to delete project:",
                        error
                    );
                }
            }
        );
    });

}

export function initializeDashboard() {

    attachCreateProjectButton();

    loadProjects();
}
