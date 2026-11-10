import { User } from "../model/users.js";
import Seminar from "../model/Seminar.js";

export async function checkUserExists(uid) {
	const exists = await User.exists({ uid });
	if (!exists) throw new Error("No user found with that ID");
}

export async function checkUsernameExists(username) {
	return User.exists({ username });
}

export async function getAUser(uid) {
	return User.findOne({ uid }).lean();
}

export async function createUser(data) {
	const user = await User.create(data);
	return user.uid;
}

export async function getUserRentals(uid) {
	const user = await User.findOne({ uid })
		.select("rentals")
		.lean();
	return user?.rentals ?? [];
}

export async function getUserSeminarRegistrations(uid) {
	const user = await User.findOne({ uid })
		.select("seminarRegistrations")
		.lean();
	return user?.seminarRegistrations ?? [];
}

export async function addRental(uid, itemId, rentalDates = []) {
	console.log("[DEBUG] addRental called with uid:", uid, "itemId:", itemId, "rentalDates:", rentalDates);

	const user = await User.findOne({ uid });
	if (!user) {
		console.log("[ERROR] User not found with uid:", uid);
		throw new Error("User not found");
	}
	console.log("[DEBUG] User found:", user.username);

	// Check if already renting this item
	const alreadyRenting = user.rentals.some(r => r.itemId.toString() === itemId && !r.returnedAt);
	if (alreadyRenting) {
		console.log("[ERROR] Already renting this item");
		throw new Error("User already has an active rental for this item");
	}

	// Convert string dates to Date objects if needed
	const dates = Array.isArray(rentalDates) && rentalDates.length > 0
		? rentalDates.map(d => {
			const dateObj = typeof d === 'string' ? new Date(d) : d;
			console.log("[DEBUG] Converted date:", d, "to", dateObj);
			return dateObj;
		})
		: [new Date()];

	console.log("[DEBUG] Final dates array:", dates);

	const rentalRecord = { itemId, dates };
	console.log("[DEBUG] Pushing rental record:", rentalRecord);
	user.rentals.push(rentalRecord);

	await user.save();
	console.log(`[SUCCESS] Rental created for user ${uid}: item ${itemId}, dates [${dates.map(d => d.toISOString()).join(", ")}]`);
	
	return { uid, itemId, dates, createdAt: new Date() };
}

export async function registerForSeminar(uid, seminarId) {
	const user = await User.findOne({ uid });
	if (!user) throw new Error("User not found");

	// Check if already registered (and not withdrawn)
	const alreadyRegistered = user.seminarRegistrations.some(r => 
		r.seminarId.toString() === seminarId && !r.withdrawnAt
	);
	if (alreadyRegistered) throw new Error("User is already registered for this seminar");

	// Check if seminar exists and is current
	const seminar = await Seminar.findById(seminarId);
	if (!seminar) throw new Error("Seminar not found");

	if (!seminar.isCurrent) {
		throw new Error("Cannot register for past seminars");
	}

	// Check capacity
	const activeRegistrations = seminar.registeredUsers ? seminar.registeredUsers.length : 0;
	if (activeRegistrations >= seminar.capacity) {
		throw new Error("Seminar is at full capacity");
	}

	// Add user to seminar's registered users
	if (!seminar.registeredUsers) {
		seminar.registeredUsers = [];
	}
	seminar.registeredUsers.push(uid);
	await seminar.save();

	// Add seminar to user's registrations
	user.seminarRegistrations.push({ seminarId, registeredAt: new Date() });
	await user.save();

	return { uid, seminarId, registeredAt: new Date() };
}

export async function cancelRental(uid, rentalIndex) {
	const user = await User.findOne({ uid });
	if (!user) throw new Error("User not found");

	// Validate rental index
	if (rentalIndex < 0 || rentalIndex >= user.rentals.length) {
		throw new Error("Rental not found");
	}

	const rental = user.rentals[rentalIndex];
	
	// Check if already cancelled or returned
	if (rental.cancelledAt) {
		throw new Error("Rental has already been cancelled");
	}
	if (rental.returnedAt) {
		throw new Error("Rental has already been returned");
	}

	// Mark rental as cancelled
	rental.cancelledAt = new Date();
	await user.save();

	return { uid, rentalIndex, cancelledAt: rental.cancelledAt };
}

export async function withdrawFromSeminar(uid, seminarIndex) {
	const user = await User.findOne({ uid });
	if (!user) throw new Error("User not found");

	// Validate seminar index
	if (seminarIndex < 0 || seminarIndex >= user.seminarRegistrations.length) {
		throw new Error("Seminar registration not found");
	}

	const registration = user.seminarRegistrations[seminarIndex];

	// Check if already withdrawn
	if (registration.withdrawnAt) {
		throw new Error("Already withdrawn from this seminar");
	}

	// Remove user from seminar's registered users
	const seminar = await Seminar.findById(registration.seminarId);
	if (seminar && seminar.registeredUsers) {
		seminar.registeredUsers = seminar.registeredUsers.filter(id => id !== uid);
		await seminar.save();
	}

	// Mark registration as withdrawn
	registration.withdrawnAt = new Date();
	await user.save();

	return { uid, seminarIndex, withdrawnAt: registration.withdrawnAt };
}

export async function getAllRentals() {
	return User.aggregate([
		{ $match: { "rentals.0": { $exists: true } } },
		{ $unwind: { path: "$rentals", includeArrayIndex: "rentalIndex" } },
		{
			$lookup: {
				from: "inventoryitems",
				localField: "rentals.itemId",
				foreignField: "_id",
				as: "item",
			},
		},
		{ $unwind: { path: "$item", preserveNullAndEmptyArrays: true } },
		{
			$project: {
				_id: 0,
				userId: "$_id",
				username: 1,
				email: 1,
				rentalIndex: 1,
				rental: {
					_id: "$rentals._id",
					itemId: "$rentals.itemId",
					itemName: "$item.name",
					dates: "$rentals.dates",
					cancelledAt: "$rentals.cancelledAt",
					returnedAt: "$rentals.returnedAt",
					createdAt: "$rentals.createdAt",
				},
			},
		},
	]);
}

export default {
	checkUserExists,
	checkUsernameExists,
	getAUser,
	createUser,
	getUserRentals,
	getUserSeminarRegistrations,
	addRental,
	registerForSeminar,
	cancelRental,
	withdrawFromSeminar,
	getAllRentals,
};
