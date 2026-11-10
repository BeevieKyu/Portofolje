import mongoose, { Schema } from 'mongoose';

const CommentSchema = new Schema(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    author: {
      type: {
        type: String,
        enum: ['registered', 'anonymous', 'admin'],
        required: true
      },
      id: {
        type: Schema.Types.Mixed,
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
  }
);

export default mongoose.model('Comment', CommentSchema);