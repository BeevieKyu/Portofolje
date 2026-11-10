import mongoose from "mongoose";
import { hashedPwd } from "../utils/hash.js";
import { MAX_USERNAME_LENGTH,
	MIN_USERNAME_LENGTH,
	MIN_PWD_LENGTH,
	MAX_PWD_LENGTH } from "../configs/constants.js";

const userSchema = new mongoose.Schema({
    uid: {
        type: Number,
        min: 0,
        max: Number.MAX_SAFE_INTEGER,
        index: true,
        required: true
    },
    username: {
        type: String,
        required: true,
        minLength: [MIN_USERNAME_LENGTH, `Username can't be shorter than ${MIN_USERNAME_LENGTH} characters`],
        maxlength: [MAX_USERNAME_LENGTH, `Username can't be longer than ${MAX_USERNAME_LENGTH} characters`],
        match: [/^\w+$/, "Username can only contain alphanumeric characters"]
    },
    pwd: {
        type: String,
		required: true,
		trim: true,
        minLength: [MIN_PWD_LENGTH, `Passwords can't be shorter than ${MIN_PWD_LENGTH} characters`],
		maxLength: [MAX_PWD_LENGTH, `Are you even a human? Who can remember more than ${MAX_PWD_LENGTH}-characters?...`]
    },
    email:{
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		match: [/^.+@[a-z]+\.[a-z]+$/, "{VALUE} isn't an email."],
		validate: {
			validator: async function(email){
				// Only check uniqueness if email is being modified
				const existingUser = await User.findOne({ email });
				// Allow if no existing user, or if it's the same user being updated
				return !existingUser || existingUser._id.equals(this._id);
			},
			message: "Email {VALUE} is already in use"
		}
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user"
	},
    rentals: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "InventoryItem",
                required: true
            },
            dates: [
                {
                    type: Date,
                    required: true
                }
            ],
            createdAt: { type: Date, default: Date.now },
            returnedAt: { type: Date, default: null },
            cancelledAt: { type: Date, default: null },
        }
    ],
    seminarRegistrations: [
        {
            seminarId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Seminar",
                required: true
            },
            registeredAt: { type: Date, default: Date.now },
            withdrawnAt: { type: Date, default: null },
        }
    ],
})

userSchema.pre("validate", function(){
	if(this.isModified("uid")){
		if(this.uid !== undefined){
			console.warn("UIDs are supposed to be auto-generated. Discarding the passed value: ", this.uid);
		}
		this.uid = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
	}
	if(this.isModified("pwd")){
		this.pwd = hashedPwd(this.pwd);
	}
});

export const User = mongoose.model("User", userSchema);
