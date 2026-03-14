import mongoose, { Document, Schema } from 'mongoose';

export interface IOrdinance extends Document {
  ordinanceNumber: string;
  series: string;
  title: string;
  content: string;
  templateId?: mongoose.Types.ObjectId;
  status: 'Draft' | 'Pending' | 'Approved';
  isPublic: boolean;
  scannedCopy?: string;
  signatories: Array<{
    name: string;
    position: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    signature?: string;
  }>;
  author: string;
  dateIntroduced: Date;
  dateApproved?: Date;
  paperSize: string;
  pageCount: number;
}

const signatorySchema = new Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  alignment: { 
    type: String, 
    enum: ['Left', 'Center', 'Right', 'Justify'], 
    default: 'Left' 
  },
  signature: { type: String }
}, { _id: false });

const ordinanceSchema = new Schema<IOrdinance>({
  ordinanceNumber: {
    type: String,
    required: true,
    trim: true
  },
  series: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'OrdinanceTemplate'
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
  scannedCopy: {
    type: String
  },
  signatories: [signatorySchema],
  author: {
    type: String,
    required: true
  },
  dateIntroduced: {
    type: Date,
    default: Date.now
  },
  dateApproved: {
    type: Date
  },
  paperSize: {
    type: String,
    default: 'A4'
  },
  pageCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

export default mongoose.model<IOrdinance>('Ordinance', ordinanceSchema);
