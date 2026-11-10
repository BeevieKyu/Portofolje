import mongoose, { Schema } from 'mongoose';

const MatchSchema = new Schema({
  player1: { type: Schema.Types.ObjectId, ref: 'User' },
  player2: { type: Schema.Types.ObjectId, ref: 'User' },
  gameId: { type: Schema.Types.ObjectId, ref: 'Game' },
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'bye'],
    default: 'pending'
  }
});

const RoundSchema = new Schema({
  roundNumber: { type: Number, required: true },
  matches: [MatchSchema]
});

const TournamentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  variant: {
    rounds: {
      type: Number,
      enum: [3, 5, 7],
      required: true
    },
    straightsAllowed: {
      type: Boolean,
      required: true
    },
    timePerRound: {
      type: Number,
      enum: [3, 10, 30],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  startDate: {
    type: Date,
    required: true
  },
  maxParticipants: {
    type: Number,
    default: 8,
    min: 2
  },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  bracket: [RoundSchema],
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  trophy: {
    title: String,
    imageUrl: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Tournament', TournamentSchema);
