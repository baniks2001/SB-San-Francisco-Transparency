import mongoose, { Document, Schema } from 'mongoose';

export interface IProcurement extends Document {
  procurementNumber: string;
  title: string;
  description: string;
  amount: number;
  status: 'Draft' | 'Pending' | 'Approved';
  isPublic: boolean;
  documentFile?: string;
  datePosted: Date;
  dateApproved?: Date;
  procurementType: string;
  supplier?: string;
  createdBy: mongoose.Types.ObjectId;
}

const procurementSchema = new Schema<IProcurement>({
  procurementNumber: {
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
  amount: {
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
  datePosted: {
    type: Date,
    default: Date.now
  },
  dateApproved: {
    type: Date
  },
  procurementType: {
    type: String,
    required: true
  },
  supplier: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IProcurement>('Procurement', procurementSchema);
