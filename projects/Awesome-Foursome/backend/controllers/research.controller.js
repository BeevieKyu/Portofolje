import researchServices from "../services/research.service.js";

export async function getResearchProjects(_req, res, next) {
    try {
        const projects = await researchServices.getAllResearchProjects();
        return res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
}

export async function getResearchProject(req, res, next) {
    try {
        const project = await researchServices.getResearchProject(req.params.id);
        if (!project) return res.status(404).json({ message: "Research project not found" });
        return res.status(200).json(project);
    } catch (error) {
        next(error);
    }
}

export async function createResearchProject(req, res, next) {
    try {
        const newProject = await researchServices.createResearchProject(req.body);
        return res.status(201).json(newProject);
    } catch (error) {
        next(error);
    }
}

export async function updateResearchProject(req, res, next) {
    try {
        const project = await researchServices.getResearchProject(req.params.id);
        if (!project) return res.status(404).json({ message: "Research project not found" });
        const updated = await researchServices.updateResearchProject(req.params.id, req.body);
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function deleteResearchProject(req, res, next) {
    try {
        const deleted = await researchServices.deleteResearchProject(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Research project not found" });
        return res.status(200).json({ message: "Research project deleted" });
    } catch (error) {
        next(error);
    }
}

export async function getResearchers(_req, res, next) {
    try {
        const researchers = await researchServices.getAllResearchers();
        return res.status(200).json(researchers);
    } catch (error) {
        next(error);
    }
}

export async function getResearcher(req, res, next) {
    try {
        const researcher = await researchServices.getResearcher(req.params.id);
        if (!researcher) return res.status(404).json({ message: "Researcher not found" });
        return res.status(200).json(researcher);
    } catch (error) {
        next(error);
    }
}

export async function createResearcher(req, res, next) {
    try {
        const newResearcher = await researchServices.createResearcher(req.body);
        return res.status(201).json(newResearcher);
    } catch (error) {
        next(error);
    }
}

export async function updateResearcher(req, res, next) {
    try {
        const researcher = await researchServices.getResearcher(req.params.id);
        if (!researcher) return res.status(404).json({ message: "Researcher not found" });
        const updated = await researchServices.updateResearcher(req.params.id, req.body);
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function deleteResearcher(req, res, next) {
    try {
        const deleted = await researchServices.deleteResearcher(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Researcher not found" });
        return res.status(200).json({ message: "Researcher deleted" });
    } catch (error) {
        next(error);
    }
}

export default {
    getResearchProjects,
    getResearchProject,
    createResearchProject,
    updateResearchProject,
    deleteResearchProject,
    getResearchers,
    getResearcher,
    createResearcher,
    updateResearcher,
    deleteResearcher,
};
