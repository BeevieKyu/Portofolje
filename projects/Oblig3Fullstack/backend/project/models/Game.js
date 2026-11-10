import mongoose, { Schema } from 'mongoose';

const GameSchema = new Schema(
  {
    players: [{
      type: {
        type: String,
        enum: ['registered', 'anonymous'],
        required: true
      },
      id: {
        type: Schema.Types.Mixed,
        required: true
      }
    }],
    
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

    matchPreferences: {
      allowAnonymous: {
        type: Boolean,
        default: true
      },
      minElo: {
        type: Number,
        default: null
      },
      maxElo: {
        type: Number,
        default: null
      }
    },
    
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending'
    },
    
    createdAt: {
      type: Date,
      default: Date.now
    },
    
    startedAt: Date,
    completedAt: Date,
    
    winner: {
      type: Schema.Types.Mixed,
    },

    eloDeltas: [{
      userId: {
        type: String,
        required: true
      },
      delta: {
        type: Number,
        required: true
      }
    }],
    
    finalScores: {
      player1: Number,
      player2: Number
    },

    rolls: {
      type: [Schema.Types.Mixed],
      default: []
    },

    holds: {
      type: [Schema.Types.Mixed],
      default: []
    }
  }
);

export default mongoose.model('Game', GameSchema);