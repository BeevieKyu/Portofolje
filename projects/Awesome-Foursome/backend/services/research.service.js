import ResearchProject from "../model/Research.js";
import Researcher from "../model/Researcher.js";

// --- Research Project Services ---

export async function getAllResearchProjects() {
	return ResearchProject.find().sort({ year: -1, createdAt: -1 }).lean();
}

export async function getResearchProject(id) {
	return ResearchProject.findById(id).lean();
}

export async function createResearchProject(data) {
	const { title, description = "", researchers = "", tags = [], status = "active", image = "", researcherRef = null } = data;
	return ResearchProject.create({
		title,
		description,
		researchers,
		tags,
		status,
		image,
		researcherRef,
	});
}

export async function updateResearchProject(id, updates) {
	return ResearchProject.findByIdAndUpdate(
		id,
		updates,
		{ new: true, runValidators: true }
	);
}

export async function deleteResearchProject(id) {
	return ResearchProject.findByIdAndDelete(id);
}

// --- Researcher Services ---

export async function getAllResearchers() {
	return Researcher.find().sort({ name: 1 }).lean();
}

export async function getResearcher(id) {
	return Researcher.findById(id).lean();
}

export async function createResearcher(data) {
	const { name, title = "", bio = "", email = "", photo = "", researchInterests = [] } = data;
	return Researcher.create({
		name,
		title,
		bio,
		email,
		photo,
		researchInterests,
	});
}

export async function updateResearcher(id, updates) {
	return Researcher.findByIdAndUpdate(
		id,
		updates,
		{ new: true, runValidators: true }
	);
}

export async function deleteResearcher(id) {
	return Researcher.findByIdAndDelete(id);
}

export default {
	// Research Projects
	getAllResearchProjects,
	getResearchProject,
	createResearchProject,
	updateResearchProject,
	deleteResearchProject,
	// Researchers
	getAllResearchers,
	getResearcher,
	createResearcher,
	updateResearcher,
	deleteResearcher,
};
