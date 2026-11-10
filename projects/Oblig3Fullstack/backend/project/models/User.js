import mongoose, { Schema } from 'mongoose';
import { randomUUID } from 'node:crypto';

function generatePublicId() {
  return `usr_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

const UserSchema = new Schema(
  {
    publicId: {
      type: String,
      unique: true,
      index: true,
      default: generatePublicId,
      immutable: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    passwordSalt: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },


    userType: {
      type: String,
      enum: ['anonymous', 'registered', 'admin'],
      default: 'registered',
    },

    eloRating: {
      type: Number,
      default: 1200,
    },
    eloRatingChange: {
      type: Number,
      default: 0, 
    },
    totalMatches: {
      type: Number,
      default: 0,
    },
    totalWins: {
      type: Number,
      default: 0,
    },
    winPercentage: {
      type: Number,
      default: 0,
    },

    appearancePreferences: {
      isDarkMode: {
        type: Boolean,
        default: false,
      },
      boardColor: {
        type: String,
        default: 'pink',
      },
      soundEnabled: {
        type: Boolean,
        default: true,
      },
      lobbyPreviewCount: {
        type: Number,
        default: 6,
      },
    },


    trophies: [
      {
        tournamentId: {
          type: Schema.Types.ObjectId,
          ref: 'Tournament',
        },
        tournamentName: String,
        trophyTitle: String,
        trophyImageUrl: String,
        wonDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],

   
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },


    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: Date,
  },
  {
    collection: 'users',
    timestamps: true, 
  }
);

UserSchema.index({ eloRating: -1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ createdAt: -1 });

UserSchema.pre('save', function ensurePublicId() {
  if (!this.publicId) {
    this.publicId = generatePublicId();
  }
});

export default mongoose.model('User', UserSchema);