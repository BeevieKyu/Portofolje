import { connectDB, disconnectDB } from "../configs/db.config.js";
import Seminar from "../model/Seminar.js";

const seminars = [
	{
		title: "Machine Learning Basics",
		description: "Introduction to Machine Learning and Neural Networks",
		professor: "Dr. Sarah Chen",
		room: "Auditorium A",
		time: "Monday 14:00-16:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: true,
		capacity: 30,
		registeredUsers: [1, 2, 3, 5, 7, 8]
	},
	{
		title: "Computer Vision Applications",
		description: "Deep Learning Applications in Computer Vision",
		professor: "Prof. Johan Eriksen",
		room: "Lab Room 201",
		time: "Wednesday 10:00-12:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: true,
		capacity: 20,
		registeredUsers: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
	},
	{
		title: "Natural Language Processing",
		description: "Natural Language Processing: From Theory to Practice",
		professor: "Dr. Maria Rodriguez",
		room: "Conference Room B",
		time: "Tuesday 13:00-15:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: true,
		capacity: 40,
		registeredUsers: [1, 3, 5, 8, 10]
	},
	{
		title: "Reinforcement Learning & Game AI",
		description: "Reinforcement Learning and Game AI",
		professor: "Prof. Alex Thompson",
		room: "Seminar Room 3",
		time: "Friday 11:00-13:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: true,
		capacity: 25,
		registeredUsers: [2, 4, 6, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
	},
	{
		title: "Ethical AI & Responsible ML",
		description: "Ethical AI and Responsible Machine Learning",
		professor: "Dr. Amira Patel",
		room: "Auditorium C",
		time: "Thursday 15:00-17:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: true,
		capacity: 50,
		registeredUsers: [1, 2, 3]
	},
	{
		title: "Data Analysis & Visualization",
		description: "Advanced Data Analysis and Visualization",
		professor: "Prof. Klaus Mueller",
		room: "Lab Room 205",
		time: "Monday 10:00-12:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: true,
		capacity: 35,
		registeredUsers: [3, 5, 7, 9]
	},
	{
		title: "Quantum Computing Fundamentals",
		description: "Quantum Computing Fundamentals",
		professor: "Dr. James Wilson",
		room: "Conference Room A",
		time: "Wednesday 14:00-16:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: false,
		capacity: 30,
		registeredUsers: [1, 2, 3, 4, 5]
	},
	{
		title: "Robotics & Autonomous Systems",
		description: "Robotics and Autonomous Systems",
		professor: "Prof. Elena Volkov",
		room: "Lab Room 150",
		time: "Tuesday 11:00-13:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: true,
		capacity: 28,
		registeredUsers: [2, 5, 8, 11]
	},
	{
		title: "Cybersecurity & Network Defense",
		description: "Cybersecurity and Network Defense",
		professor: "Dr. Robert Kim",
		room: "Conference Room D",
		time: "Thursday 10:00-12:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: false,
		capacity: 25,
		registeredUsers: [1, 3, 5, 7, 9]
	},
	{
		title: "Human-Computer Interaction Design",
		description: "Human-Computer Interaction Design",
		professor: "Prof. Sophie Laurent",
		room: "Seminar Room 1",
		time: "Friday 13:00-15:00",
		image: "https://media.istockphoto.com/id/1783743772/photo/female-speaker-giving-a-presentation-during-business-seminar-at-convention-center.jpg?s=1024x1024&w=is&k=20&c=_vG6anN_hY8YxPUBtwa8sXu0W7B6e6Qt7KxuDGNPlpE=",
		isCurrent: true,
		capacity: 22,
		registeredUsers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
	},
];

await connectDB();

console.log("🌱 Seeding seminars...\n");

for (const seminarData of seminars) {
	const exists = await Seminar.findOne({ title: seminarData.title });
	if (exists) {
		// Update existing seminar with capacity and registeredUsers if not set
		if (!exists.capacity) {
			exists.capacity = seminarData.capacity || 50;
		}
		if (!exists.registeredUsers || exists.registeredUsers.length === 0) {
			exists.registeredUsers = seminarData.registeredUsers || [];
		}
		await exists.save();
		console.log(`⏹️  Updated "${seminarData.title}" with capacity and bookings`);
		continue;
	}
	const seminar = new Seminar(seminarData);
	await seminar.save();
	console.log(`✅ Created seminar: ${seminarData.title}`);
	console.log(`   Professor: ${seminarData.professor} | Room: ${seminarData.room} | Time: ${seminarData.time}`);
	console.log(`   Status: ${seminarData.isCurrent ? "Current" : "Past"} | Capacity: ${seminarData.capacity} | Booked: ${seminarData.registeredUsers ? seminarData.registeredUsers.length : 0}\n`);
}

await disconnectDB();
console.log("✨ Done seeding seminars!");
