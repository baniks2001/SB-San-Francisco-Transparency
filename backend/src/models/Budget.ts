import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  budgetNumber: string;
  title: string;
  description: string;
  totalAmount: number;
  allocatedAmount: number;
  status: 'Draft' | 'Pending' | 'Approved';
  isPublic: boolean;
  documentFile?: string;
  fiscalYear: string;
  department: string;
  datePosted: Date;
  dateApproved?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const budgetSchema = new Schema<IBudget>({
  budgetNumber: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  allocatedAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved'],
    default: 'Draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  documentFile: {
    type: String
  },
  fiscalYear: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  dateApproved: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IBudget>('Budget', budgetSchema);
