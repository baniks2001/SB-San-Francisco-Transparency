import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  vacancyId: mongoose.Types.ObjectId;
  fullName: string;
  age: number;
  mobileNumber: string;
  email: string;
  address: string;
  resume?: string;
  certificates?: string[];
  status: 'Under Review' | 'Hired' | 'Rejected';
  dateApplied: Date;
  notes?: string;
}

const applicationSchema = new Schema<IApplication>({
  vacancyId: {
    type: Schema.Types.ObjectId,
    ref: 'Vacancy',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  resume: {
    type: String
  },
  certificates: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Under Review', 'Hired', 'Rejected'],
    default: 'Under Review'
  },
  dateApplied: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IApplication>('Application', applicationSchema);
