import { getProjectById } from "../services/projectService.js";

export async function initializeSchemaCanvas() {

    const projectId = 
        localStorage.getItem(
            "schemaforge.currentProject"
        );

    if (!projectId) {

        showDesignerMessage(
            "No project selected."
        );

        return;
    }

    try {

        const project = await getProjectById(projectId);

        if (!project) {

            showDesignerMessage(
                "The selected project no longer exists."
            );

            return;
        }

        renderProjectHeader(project);
    } catch (error) {
        
        console.error(
            "Failed to load project:",
            error 
        );

        showDesignerMessage(
            "Failed to load the projects."
        );
    }  
}

function renderProjectHeader(project) {

    const projectTitle =
        document.getElementById(
            "project-title"
        );

    const projectDescription =
        document.getElementById(
            "project-description"
        );


    if (projectTitle) {
        projectTitle.textContent =
            project.name;
    }


    if (projectDescription) {
        projectDescription.textContent =
            project.description;
    }
}

function showDesignerMessage(message) {

    const canvas =
        document.getElementById(
            "schema-canvas"
        );

    if (!canvas) {
        return;
    }

    canvas.innerHTML = `
        <div class="canvas-placeholder">
            <h2>${message}</h2>
        </div>
    `;
}