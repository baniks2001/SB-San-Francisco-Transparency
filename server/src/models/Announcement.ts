import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: 'Urgent' | 'Normal' | 'Low';
  documentFile?: string;
  isActive: boolean;
  datePosted: Date;
  expiryDate?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const announcementSchema = new Schema<IAnnouncement>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Urgent', 'Normal', 'Low'],
    default: 'Normal'
  },
  documentFile: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
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

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema);
