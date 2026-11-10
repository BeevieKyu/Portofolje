import seminarServices from "../services/seminar.service.js";

export async function getSeminars(req, res, next) {
    try {
        const filter = {};
        if (req.query.current !== undefined) filter.isCurrent = req.query.current === "true";

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));

        const result = await seminarServices.getAllSeminars(filter, { page, limit });
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getSeminar(req, res, next) {
    try {
        const seminar = await seminarServices.getSeminar(req.params.id);
        if (!seminar) return res.status(404).json({ message: "Seminar not found" });
        return res.status(200).json(seminar);
    } catch (error) {
        next(error);
    }
}

export async function createSeminar(req, res, next) {
    try {
        if (req.file) req.body.image = `/uploads/${req.file.filename}`;
        const seminar = await seminarServices.createSeminar(req.body);
        return res.status(201).json(seminar);
    } catch (error) {
        next(error);
    }
}

export async function updateSeminar(req, res, next) {
    try {
        const seminar = await seminarServices.getSeminar(req.params.id);
        if (!seminar) return res.status(404).json({ message: "Seminar not found" });

        if (req.file) req.body.image = `/uploads/${req.file.filename}`;

        const updated = await seminarServices.updateSeminar(seminar, req.body);
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function deleteSeminar(req, res, next) {
    try {
        const deleted = await seminarServices.deleteSeminar(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Seminar not found" });
        return res.status(200).json({ message: "Seminar deleted" });
    } catch (error) {
        next(error);
    }
}

export default {
    getSeminars,
    getSeminar,
    createSeminar,
    updateSeminar,
    deleteSeminar,
};
