import userServices from "../services/user.service.js";

export async function getAllRentals(req, res, next) {
    try {
        const rentals = await userServices.getAllRentals();
        res.json(rentals);
    } catch (error) {
        next(error);
    }
}

export async function getRentals(req, res, next) {
    try {
        const rentals = await userServices.getUserRentals(req.params.uid);
        res.json({ uid: req.params.uid, rentals });
    } catch (error) {
        next(error);
    }
}

export async function getSeminarRegistrations(req, res, next) {
    try {
        const registrations = await userServices.getUserSeminarRegistrations(req.params.uid);
        res.json({ uid: req.params.uid, seminarRegistrations: registrations });
    } catch (error) {
        next(error);
    }
}

export async function createRental(req, res, next) {
    try {
        const uid = req.user?.uid;
        const { itemId, rentalDates } = req.body;

        if (!itemId) return res.status(400).json({ message: "itemId is required" });

        const rental = await userServices.addRental(uid, itemId, rentalDates);
        return res.status(201).json({ message: "Rental request created", rental });
    } catch (error) {
        next(error);
    }
}

export async function registerSeminar(req, res, next) {
    try {
        const uid = req.user.uid;
        const seminarId = req.params.id;

        const registration = await userServices.registerForSeminar(uid, seminarId);
        return res.status(201).json({ message: "Seminar registration successful", registration });
    } catch (error) {
        next(error);
    }
}

export async function cancelRental(req, res, next) {
    try {
        const uid = req.user.uid;
        const rentalIndex = parseInt(req.params.rentalIndex, 10);

        if (isNaN(rentalIndex)) return res.status(400).json({ message: "Invalid rental index" });

        const result = await userServices.cancelRental(uid, rentalIndex);
        return res.status(200).json({ message: "Rental cancelled successfully", result });
    } catch (error) {
        next(error);
    }
}

export async function withdrawFromSeminar(req, res, next) {
    try {
        const uid = req.user.uid;
        const seminarIndex = parseInt(req.params.seminarIndex, 10);

        if (isNaN(seminarIndex)) return res.status(400).json({ message: "Invalid seminar index" });

        const result = await userServices.withdrawFromSeminar(uid, seminarIndex);
        return res.status(200).json({ message: "Withdrawn from seminar successfully", result });
    } catch (error) {
        next(error);
    }
}

export default {
    getAllRentals,
    getRentals,
    getSeminarRegistrations,
    createRental,
    registerSeminar,
    cancelRental,
    withdrawFromSeminar,
};
