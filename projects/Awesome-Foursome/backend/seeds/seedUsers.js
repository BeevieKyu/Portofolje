import { connectDB, disconnectDB } from "../configs/db.config.js";
import { User } from "../model/users.js";

const users = [
	{
		uid: 0,
		username: "adminuser",
		email: "admin@hcai.no",
		pwd: "adminpass123",
		role: "admin",
	},
	{
		uid: 0,
		username: "regularuser",
		email: "user@hcai.no",
		pwd: "userpass123",
		role: "user",
	},
];

await connectDB();

for (const userData of users) {
	const exists = await User.findOne({ email: userData.email });
	if (exists) {
		console.log(`Skipping ${userData.email} — already exists`);
		continue;
	}
	const user = new User(userData);
	await user.save();
	console.log(`Created ${userData.role}: ${userData.username} (${userData.email})`);
}

await disconnectDB();
console.log("Done.");
