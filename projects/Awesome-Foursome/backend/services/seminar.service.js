import Seminar from "../model/Seminar.js";

export async function getAllSeminars(filter = {}, options = {}) {
	const { page = 1, limit = 10 } = options;
	const skip = (page - 1) * limit;
	
	const seminars = await Seminar.find(filter)
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean();
	
	const total = await Seminar.countDocuments(filter);
	const totalPages = Math.ceil(total / limit);
	
	return {
		data: seminars,
		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1
		}
	};
}

export async function getSeminar(id) {
	return Seminar.findById(id);
}

export async function createSeminar(data) {
	const { title, description, professor, room, time, image, isCurrent, capacity } = data;
	return Seminar.create({ title, description, professor, room, time, image, isCurrent, capacity });
}

export async function updateSeminar(seminar, updates) {
	const fields = ["title", "description", "professor", "room", "time", "image", "isCurrent", "capacity"];
	fields.forEach((f) => {
		if (Object.prototype.hasOwnProperty.call(updates, f)) seminar[f] = updates[f];
	});
	return seminar.save();
}

export async function deleteSeminar(id) {
	return Seminar.findByIdAndDelete(id);
}

export default {
	getAllSeminars,
	getSeminar,
	createSeminar,
	updateSeminar,
	deleteSeminar,
};
