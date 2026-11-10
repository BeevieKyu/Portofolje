import mongoose, { Schema } from 'mongoose';

const TournamentCommentSchema = new Schema({
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  author: {
    type: {
      type: String,
      enum: ['registered', 'admin'],
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('TournamentComment', TournamentCommentSchema);
