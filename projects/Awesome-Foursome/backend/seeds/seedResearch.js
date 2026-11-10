import * as cheerio from "cheerio";
import { connectDB, disconnectDB } from "../configs/db.config.js";
import Researcher from "../model/Researcher.js";
import ResearchProject from "../model/Research.js";

const NTNU_URL = "https://www.ntnu.edu/hcai";

const MAX_LENGTHS = {
	name: 120,
	title: 120,
	bio: 2000,
	email: 200,
	photo: 500,
	interest: 80,
};

function clampText(value, maxLength) {
	if (!value) return "";
	return String(value).trim().slice(0, maxLength);
}

function sanitizeResearcherFields(fields) {
	return {
		...fields,
		name: clampText(fields.name, MAX_LENGTHS.name),
		title: clampText(fields.title, MAX_LENGTHS.title),
		bio: clampText(fields.bio, MAX_LENGTHS.bio),
		email: clampText(fields.email, MAX_LENGTHS.email),
		photo: clampText(fields.photo, MAX_LENGTHS.photo),
		researchInterests: Array.isArray(fields.researchInterests)
			? fields.researchInterests
				.map((item) => clampText(item, MAX_LENGTHS.interest))
				.filter(Boolean)
				.slice(0, 8)
			: []
	};
}

async function scrapeEmployeePage(username) {
	try {
		const url = `https://www.ntnu.edu/employees/${username}`;
		const response = await fetch(url);
		if (!response.ok) return {};
		const html = await response.text();
		const $ = cheerio.load(html);

		// Photo: first backends.it.ntnu.no profile image (own photo, not co-authors)
		let photo = "";
		$("img").each((_i, el) => {
			if (photo) return false;
			const src = $(el).attr("src") || "";
			if (src.includes("backends.it.ntnu.no") || src.includes("user-profile-service")) {
				photo = src;
			}
		});

		// Extract CRISTIN person ID from NVA research profile link
		let cristinId = "";
		$("a[href*='nva.sikt.no/research-profile/']").each((_i, el) => {
			const href = $(el).attr("href") || "";
			const match = href.match(/research-profile\/(\d+)/);
			if (match) cristinId = match[1];
		});

		// Find sections by heading text - extract the paragraphs that follow
		function textAfterHeading(keyword) {
			let text = "";
			$("h2, h3, h4, strong").each((_i, el) => {
				if ($(el).text().trim().toLowerCase().includes(keyword)) {
					let node = $(el).parent();
					node.find("p").each((_j, p) => {
						const t = $(p).text().trim();
						if (t) text += (text ? " " : "") + t;
					});
					if (!text) {
						$(el).nextAll("p").each((_j, p) => {
							const t = $(p).text().trim();
							if (t) text += (text ? " " : "") + t;
						});
					}
				}
			});
			return text;
		}

		const bio = textAfterHeading("about");

		// Extract competency tags from the NTNU employee page
		const competencyTags = [];
		$(".competency-pill span[rel='tag']").each((_i, el) => {
			const tag = $(el).text().trim();
			if (tag) competencyTags.push(tag);
		});

		const interestsText = textAfterHeading("research interest");
		const interestsList = interestsText
			? interestsText.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 3 && s.length < 80).slice(0, 8)
			: [];

		const researchInterests = interestsList.length ? interestsList : competencyTags;

		return { photo, bio, researchInterests, cristinId };
	} catch {
		return {};
	}
}

async function fetchCristinPublications(cristinId) {
	try {
		const url = `https://api.cristin.no/v2/persons/${cristinId}/results?lang=en&per_page=100`;
		const response = await fetch(url);
		if (!response.ok) return [];
		const results = await response.json();

		return results.map(result => {
			const title = result.title?.en || result.title?.nb || Object.values(result.title || {})[0] || "";
			const year = result.year_published ? parseInt(result.year_published) : null;
			const venue = (result.journal?.name || result.channel?.title || "").slice(0, 500);
			const links = result.links || [];
			const pubUrl = (
				links.find(l => l.url_type === "DOI") ||
				links.find(l => l.url_type === "ARKIV") ||
				links.find(l => l.url_type === "URL")
			)?.url || "";
			const authors = (result.contributors?.preview || [])
				.map(c => `${c.first_name} ${c.surname}`)
				.join(", ")
				.slice(0, 500);

			return { title: title.slice(0, 200), year, venue, url: pubUrl, researchers: authors };
		}).filter(p => p.title.length > 0);
	} catch {
		return [];
	}
}

async function scrapeResearchers() {
	console.log(`🌐 Fetching ${NTNU_URL}...\n`);
	const response = await fetch(NTNU_URL);
	if (!response.ok) throw new Error(`Failed to fetch NTNU page: ${response.status}`);
	const html = await response.text();
	const $ = cheerio.load(html);

	const researchers = [];

	$("a.personList").each((_i, el) => {
		const name = $(el).find("span.fullname").text().trim();
		const title = $(el).find("span.role").text().trim();
		const photo = $(el).find("img.portrait").attr("src") || "";
		const profilePath = $(el).attr("href") || "";

		const username = profilePath.replace("/employees/", "").trim();
		const email = username ? `${username}@ntnu.no` : "";

		if (name) {
			researchers.push({ name, title, email, photo, bio: "", researchInterests: [], username });
		}
	});

	// Enrich each researcher with data from their employee page
	for (const r of researchers) {
		if (!r.username) continue;
		console.log(`  📄 Scraping employee page for ${r.name}...`);
		const extra = await scrapeEmployeePage(r.username);
		if (extra.photo) r.photo = extra.photo;
		if (extra.bio) r.bio = extra.bio;
		if (extra.researchInterests?.length) r.researchInterests = extra.researchInterests;
		if (extra.cristinId) r.cristinId = extra.cristinId;
	}

	return researchers;
}


function deriveTagsFromVenue(venue) {
	const tags = [];
	const v = venue.toLowerCase();
	if (v.includes("chi") || v.includes("human-computer") || v.includes("hci")) tags.push("HCI");
	if (v.includes("robot")) tags.push("Robotics");
	if (v.includes("ai") || v.includes("artificial intelligence")) tags.push("AI");
	if (v.includes("learn") || v.includes("education")) tags.push("Education");
	if (v.includes("autonomous") || v.includes("ferry")) tags.push("Autonomous Systems");
	if (v.includes("nordic")) tags.push("Nordic HCI");
	if (v.includes("interact")) tags.push("HCI");
	if (v.includes("design")) tags.push("Design");
	return [...new Set(tags)];
}

const INTEREST_RULES = [
	{ keywords: ["human-computer interaction", "hci", " chi ", "chi conference"], label: "Human-Computer Interaction" },
	{ keywords: ["human-robot interaction", "hri", "robot"], label: "Human-Robot Interaction" },
	{ keywords: ["artificial intelligence", " ai ", "machine learning", "deep learning", "neural"], label: "Artificial Intelligence" },
	{ keywords: ["autonomous", "ferry", "ship", "maritime", "shore control"], label: "Autonomous Systems" },
	{ keywords: ["interaction design", "ux", "user experience", "usability"], label: "Interaction Design" },
	{ keywords: ["health", "medical", "clinical", "hospital", "patient"], label: "Health Informatics" },
	{ keywords: ["education", "learning", "teaching", "student"], label: "Education Technology" },
	{ keywords: ["privacy", "surveillance", "security"], label: "Privacy & Security" },
	{ keywords: ["accessibility", "accessible", "disability"], label: "Accessibility" },
	{ keywords: ["game", "player", "gamif"], label: "Game Studies" },
	{ keywords: ["visualization", "visual analytics", "information visual"], label: "Information Visualization" },
	{ keywords: ["natural language", "nlp", "conversational", "chatbot", "voice assistant"], label: "Natural Language Processing" },
	{ keywords: ["ethic", "bias", "fairness", "trust"], label: "AI Ethics" },
	{ keywords: ["social robot", "social computing"], label: "Social Computing" },
	{ keywords: ["nordic"], label: "Nordic HCI" },
	{ keywords: ["color", "colour", "aesthetic", "visual design"], label: "Visual Design" },
];

function deriveInterestsFromPublications(publications) {
	const counts = {};
	for (const pub of publications) {
		const text = `${pub.title} ${pub.venue}`.toLowerCase();
		for (const rule of INTEREST_RULES) {
			if (rule.keywords.some(kw => text.includes(kw))) {
				counts[rule.label] = (counts[rule.label] || 0) + 1;
			}
		}
	}
	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 6)
		.map(([label]) => label);
}

await connectDB();

const researchers = await scrapeResearchers();
console.log(`📋 Found ${researchers.length} researchers on NTNU page\n`);

console.log("🌱 Seeding researchers...\n");
for (const data of researchers) {
	const { username, ...rawFields } = data;
	const fields = sanitizeResearcherFields(rawFields);
	const exists = await Researcher.findOne({ name: data.name });
	if (exists) {
		await Researcher.updateOne({ _id: exists._id }, { $set: fields });
		console.log(`🔄 Updated researcher: ${data.name}`);
		continue;
	}
	await Researcher.create(fields);
	console.log(`✅ Created researcher: ${data.name} (${data.title})`);
}

console.log("🌱 Seeding publications...\n");

await ResearchProject.deleteMany({});
console.log("🗑️  Cleared existing research projects\n");

let totalPublications = 0;
for (const data of researchers) {
	if (!data.cristinId) {
		console.log(`⚠️  No CRISTIN ID for ${data.name}, skipping publications`);
		continue;
	}
	const dbResearcher = await Researcher.findOne({ name: data.name });
	if (!dbResearcher) continue;

	console.log(`📚 Fetching CRISTIN publications for ${data.name} (ID: ${data.cristinId})...`);
	const publications = await fetchCristinPublications(data.cristinId);

	const derivedInterests = deriveInterestsFromPublications(publications);
	await Researcher.updateOne({ _id: dbResearcher._id }, { $set: { researchInterests: derivedInterests } });

	for (const pub of publications) {
		const tags = deriveTagsFromVenue(pub.venue || "");
		await ResearchProject.create({
			title: pub.title,
			description: "",
			researchers: pub.researchers,
			tags,
			status: "completed",
			url: pub.url,
			year: pub.year,
			venue: pub.venue,
			researcherRef: dbResearcher._id,
		});
		totalPublications++;
	}
	console.log(`  ✅ Added ${publications.length} publications, interests: [${derivedInterests.join(", ")}]`);
}
console.log(`\n📋 Total publications seeded: ${totalPublications}`);

await disconnectDB();
console.log("\n✨ Done seeding research data!");
