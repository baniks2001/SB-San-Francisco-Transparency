import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'meeting' | 'event' | 'hearing' | 'ceremony' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer: string;
  contactInfo?: string;
  image?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: String,
    required: [true, 'Activity date is required']
  },
  time: {
    type: String,
    required: [true, 'Activity time is required']
  },
  location: {
    type: String,
    required: [true, 'Activity location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: ['meeting', 'event', 'hearing', 'ceremony', 'other'],
    default: 'meeting'
  },
  status: {
    type: String,
    required: [true, 'Activity status is required'],
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  organizer: {
    type: String,
    required: [true, 'Organizer is required'],
    trim: true,
    maxlength: [100, 'Organizer name cannot exceed 100 characters']
  },
  contactInfo: {
    type: String,
    trim: true,
    maxlength: [200, 'Contact info cannot exceed 200 characters']
  },
  image: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ActivitySchema.index({ date: -1 });
ActivitySchema.index({ status: 1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ isPublic: 1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
