import mongoose from "mongoose";

const researchSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		maxlength: 200
	},
	description: {
		type: String,
		trim: true,
		maxlength: 2000,
		default: ""
	},
	researchers: {
		type: String,
		trim: true,
		maxlength: 500,
		default: ""
	},
	tags: {
		type: [String],
		default: []
	},
	status: {
		type: String,
		enum: ["active", "completed"],
		default: "active"
	},
	image: {
		type: String,
		trim: true,
		maxlength: 500,
		default: ""
	},
	url: {
		type: String,
		trim: true,
		maxlength: 500,
		default: ""
	},
	year: {
		type: Number,
		default: null
	},
	venue: {
		type: String,
		trim: true,
		maxlength: 500,
		default: ""
	},
	researcherRef: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Researcher",
		default: null
	}
}, {
	timestamps: true
});

const ResearchProject = mongoose.model("ResearchProject", researchSchema);

export default ResearchProject;
