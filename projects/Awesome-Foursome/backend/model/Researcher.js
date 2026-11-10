import mongoose from "mongoose";

const researcherSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		maxlength: 120
	},
	title: {
		type: String,
		trim: true,
		maxlength: 120,
		default: ""
	},
	bio: {
		type: String,
		trim: true,
		maxlength: 2000,
		default: ""
	},
	email: {
		type: String,
		trim: true,
		maxlength: 200,
		default: ""
	},
	photo: {
		type: String,
		trim: true,
		maxlength: 500,
		default: ""
	},
	researchInterests: {
		type: [String],
		default: []
	}
}, {
	timestamps: true
});

const Researcher = mongoose.model("Researcher", researcherSchema);

export default Researcher;