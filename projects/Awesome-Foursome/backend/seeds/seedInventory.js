import { connectDB, disconnectDB } from "../configs/db.config.js";
import InventoryItem from "../model/Inventory.js";

const items = [
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

await connectDB();

console.log("🌱 Seeding inventory items...\n");

for (const itemData of items) {
	const exists = await InventoryItem.findOne({ name: itemData.name });
	if (exists) {
		console.log(`⏭️  Skipping "${itemData.name}" — already exists`);
		continue;
	}
	const item = new InventoryItem(itemData);
	await item.save();
	console.log(`✅ Created item: ${itemData.name}`);
	console.log(`   Quantity: ${itemData.quantity} | Available: ${itemData.available}`);
	console.log(`   ${itemData.description}\n`);
}

await disconnectDB();
console.log("✨ Done seeding inventory!");
