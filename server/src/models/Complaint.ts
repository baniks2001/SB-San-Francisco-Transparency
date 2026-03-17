import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  complainantName?: string;
  contactNumber?: string;
  address?: string;
  email?: string;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  partiesInvolved: string;
  description: string;
  evidence?: string;
  desiredOutcome?: string;
  concernType: 'general' | 'misconduct' | 'safety' | 'child_protection';
  status: 'pending' | 'in_progress' | 'solved';
  reportFile?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>({
  complainantName: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  incidentDate: {
    type: String,
    required: true
  },
  incidentTime: {
    type: String,
    required: true
  },
  incidentLocation: {
    type: String,
    required: true,
    trim: true
  },
  partiesInvolved: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  evidence: {
    type: String
  },
  desiredOutcome: {
    type: String,
    trim: true
  },
  concernType: {
    type: String,
    enum: ['general', 'misconduct', 'safety', 'child_protection'],
    required: true,
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'solved'],
    required: true,
    default: 'pending'
  },
  reportFile: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IComplaint>('Complaint', complaintSchema);
