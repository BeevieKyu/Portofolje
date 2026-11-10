/**
 * Seed database with initial data if collections are empty
 * Called automatically on server startup
 */

import { User } from "../model/users.js";
import InventoryItem from "../model/Inventory.js";
import Seminar from "../model/Seminar.js";

// ===== USERS DATA =====
const usersData = [
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

// ===== INVENTORY DATA =====
const inventoryData = [
	{
		name: "Laptop - Development",
		quantity: 5,
		available: 4,
		description: "High-performance laptops for development work. Specs: 16GB RAM, i7 processor, SSD",
		image: "https://media.istockphoto.com/id/2209033263/vector/vector-laptop-with-blank-empty-white-screen.jpg?s=1024x1024&w=is&k=20&c=8E7eNSwByOrpdJ2LzMdfwC_Od0XyOODczlUNWefoiWc=",
	},
	{
		name: "Graphics Tablet (Wacom)",
		quantity: 8,
		available: 7,
		description: "Professional graphics tablets for design and digital art. 21.5-inch display",
		image: "https://media.istockphoto.com/id/475610536/photo/wacom-intuos-pro.jpg?s=1024x1024&w=is&k=20&c=gleFDLY75E3cbPHyJRl53Fa-iQLbhcwo9dmtLVmTnIY=",
	},
	{
		name: "4K Camera - Canon",
		quantity: 3,
		available: 2,
		description: "4K video camera for filming and documentation. Canon R5 with lenses",
		image: "https://media.istockphoto.com/id/152128250/photo/wide-angle-lens-on-a-camera.jpg?s=1024x1024&w=is&k=20&c=mryB6kfc5tw7GCS7xcLRoCGGduFl2489jE_e_KRtR5I=",
	},
	{
		name: "Microphone - USB Condenser",
		quantity: 12,
		available: 10,
		description: "Professional USB condenser microphones for podcasts and recordings",
		image: "https://media.istockphoto.com/id/1327778107/photo/studio-microphone-for-recording-podcast-or-singing.jpg?s=1024x1024&w=is&k=20&c=4PSlSPrk5pRItj48-7VSOD4cYhT6oBPGcLBJIW2E_YY=",
	},
	{
		name: "Projector - 4K",
		quantity: 2,
		available: 2,
		description: "4K projector for presentations and seminars. Brightness: 3000 lumens",
		image: "https://media.istockphoto.com/id/912129780/photo/presentation-with-lcd-video-projector-in-office.jpg?s=1024x1024&w=is&k=20&c=wmpBjlmv3CaQWmIU3rwp4kO23SgtGGva25HHCEWzGsc=",
	},
	{
		name: "Monitor - 27 inch 4K",
		quantity: 10,
		available: 8,
		description: "27-inch 4K monitors for dual/triple setup. Dell UltraSharp series",
		image: "https://media.istockphoto.com/id/2084752084/vector/vector-3d-realistic-modern-tv-screen-minimalistic-stylish-lcd-panel-led-tv-frame-large.jpg?s=1024x1024&w=is&k=20&c=zCNyST6lPD1yPhMa40t2d3LBKU_bg0UrdIwnVeGOSLA=",
	},
	{
		name: "Whiteboard - Interactive",
		quantity: 4,
		available: 3,
		description: "Interactive whiteboards for collaborative workshops. 65-inch display",
		image: "https://media.istockphoto.com/id/927784174/photo/blank-whiteboard.jpg?s=1024x1024&w=is&k=20&c=Wd4h7OHBcNmKWMILyxw52Q5hs_qJaKs7NviYBfztFGg=",
	},
	{
		name: "Workstation - Desktop GPU",
		quantity: 3,
		available: 1,
		description: "High-performance GPU workstations for ML/AI work. RTX 3090, 64GB RAM",
		image: "https://media.istockphoto.com/id/1180632542/photo/game-graphics-card-isolated-on-white-background.jpg?s=1024x1024&w=is&k=20&c=XEaoIeIm29gc678_GnjV9TDLagXQYt4w1C5ZyVuYnqY=",
	},
	{
		name: "Drone - DJI Air 3",
		quantity: 2,
		available: 2,
		description: "Professional drone for aerial photography and video coverage",
		image: "https://media.istockphoto.com/id/1401444200/photo/drone-white-color-flying-close-up.jpg?s=1024x1024&w=is&k=20&c=9vH-oozg_bx0FTk2xW3bIYVd3hxZHwYr-g-iNuNOers=",
	},
	{
		name: "Headphones - Studio Monitor",
		quantity: 6,
		available: 5,
		description: "Professional studio monitor headphones. Sony MDR-7506 quality",
		image: "https://media.istockphoto.com/id/1412240771/photo/headphones-on-white-background.jpg?s=1024x1024&w=is&k=20&c=UyOQrYwxx61kI5TwmTCye0UUvDakbeR9W_jWk1AU0Fk=",
	},
	{
		name: "External SSD - 2TB",
		quantity: 20,
		available: 16,
		description: "Fast external SSDs for data transfer and backup. 2TB capacity",
		image: "https://media.istockphoto.com/id/1454256401/photo/external-ssd-drive-for-storing-information-personal-data.jpg?s=1024x1024&w=is&k=20&c=-t1dXtKtAetVk-xGiXb1dRGSvuvuXJeJcowuUdR92x8=",
	},
	{
		name: "Lighting Kit - LED",
		quantity: 5,
		available: 4,
		description: "Professional LED lighting kit for video production and podcasting",
		image: "https://media.istockphoto.com/id/2152967640/photo/warm-ring-light-in-makeup-room-makeup-artist-vlogging.jpg?s=1024x1024&w=is&k=20&c=JNKKCITsLP4ghNP6corAr1Pkpn9lpu3v_xc0f79v7uE=",
	},
];

// ===== SEMINARS DATA =====
const seminarsData = [
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


/**
 * Seed database with initial data if collections are empty
 */
export async function runAllSeeds() {
	try {
		// Check if we should seed
		const userCount = await User.countDocuments();
		if (userCount > 0) {
			console.log("✅ Database already seeded, skipping seed process");
			return;
		}

		console.log("\n🌱 Starting database seeding...\n");

		// Seed Users
		console.log("📝 Seeding users...");
		for (const userData of usersData) {
			const exists = await User.findOne({ email: userData.email });
			if (!exists) {
				await User.create(userData);
				console.log(`  ✅ Created user: ${userData.email}`);
			}
		}

		// Seed Inventory
		console.log("\n📦 Seeding inventory...");
		for (const itemData of inventoryData) {
			const exists = await InventoryItem.findOne({ name: itemData.name });
			if (!exists) {
				await InventoryItem.create(itemData);
				console.log(`  ✅ Created inventory: ${itemData.name}`);
			}
		}

		// Seed Seminars
		console.log("\n🎓 Seeding seminars...");
		for (const seminarData of seminarsData) {
			const exists = await Seminar.findOne({ title: seminarData.title });
			if (!exists) {
				await Seminar.create(seminarData);
				console.log(`  ✅ Created seminar: ${seminarData.title}`);
			}
		}

		console.log("\n✨ Database seeding completed successfully!\n");
		console.log("ℹ️  Run 'npm run seed:research' to populate researchers and publications from the NTNU API.\n");
	} catch (error) {
		console.error("❌ Error during database seeding:", error.message);
	}
}
