import mongoose from "mongoose";

const seminarSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		maxlength: 200
	},
	description: {
		type: String,
		required: true,
		trim: true,
		maxlength: 1000
	},
	professor: {
		type: String,
		required: true,
		trim: true,
		maxlength: 120
	},
	room: {
		type: String,
		required: true,
		trim: true,
		maxlength: 120
	},
	time: {
		type: String,
		required: true,
		trim: true,
		maxlength: 120
	},
	image: {
		type: String,
		trim: true,
		maxlength: 500,
		default: ""
	},
	isCurrent: {
		type: Boolean,
		default: true
	},
	capacity: {
		type: Number,
		required: true,
		default: 50,
		min: 1
	},
	registeredUsers: [{
		type: Number,
		min: 0,
		max: Number.MAX_SAFE_INTEGER
	}]
}, {
	timestamps: true
});

const Seminar = mongoose.model("Seminar", seminarSchema);

export default Seminar;
