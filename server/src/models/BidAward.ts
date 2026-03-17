import mongoose, { Schema, Document } from 'mongoose';

export interface IBidAward extends Document {
  awardName: string;
  description: string;
  image?: string;
  document?: string;
  dateAwarded: string;
  contractor: string;
  amount: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

const BidAwardSchema: Schema = new Schema({
  awardName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  document: {
    type: String,
    default: null
  },
  dateAwarded: {
    type: String,
    required: true
  },
  contractor: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
BidAwardSchema.index({ status: 1 });
BidAwardSchema.index({ dateAwarded: -1 });
BidAwardSchema.index({ contractor: 1 });

export default mongoose.model<IBidAward>('BidAward', BidAwardSchema);
