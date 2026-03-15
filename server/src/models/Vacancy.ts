import mongoose, { Document, Schema } from 'mongoose';

export interface IVacancy extends Document {
  jobTitle: string;
  position: string;
  estimatedSalary: number;
  jobDescription: string;
  qualifications: string;
  requirements: string;
  status: 'Active' | 'Closed';
  datePosted: Date;
  closingDate?: Date;
  department: string;
  employmentType: string;
  createdBy: mongoose.Types.ObjectId;
}

const vacancySchema = new Schema<IVacancy>({
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  estimatedSalary: {
    type: Number,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  qualifications: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  closingDate: {
    type: Date
  },
  department: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IVacancy>('Vacancy', vacancySchema);
