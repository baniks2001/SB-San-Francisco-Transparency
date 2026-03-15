import mongoose, { Document, Schema } from 'mongoose';

export interface IResolution extends Document {
  resolutionNumber: string;
  series: string;
  title?: string;
  content: string;
  secondContent?: string;
  present?: Array<{name: string, position: string}>;
  absent?: Array<{name: string, position: string}>;
  templateId?: mongoose.Types.ObjectId;
  status: 'Draft' | 'Pending' | 'Approved';
  isPublic: boolean;
  scannedCopy?: string;
  signatories: Array<{
    name: string;
    position: string;
    optionalText?: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    isBold?: boolean;
    isUnderline?: boolean;
    fontSize?: number;
    fontFamily?: string;
    signature?: string;
  }>;
  attestedBy: Array<{
    name: string;
    position: string;
    optionalText?: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    isBold?: boolean;
    isUnderline?: boolean;
    fontSize?: number;
    fontFamily?: string;
    signature?: string;
  }>;
  author?: string;
  dateIntroduced: Date;
  dateApproved?: Date;
  paperSize: string;
  pageCount: number;
  presentFormat: {
    fontSize: number;
    fontFamily: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    isBold: boolean;
    isUnderline: boolean;
  };
  absentFormat: {
    fontSize: number;
    fontFamily: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    isBold: boolean;
    isUnderline: boolean;
  };
  secondContentFormat: {
    fontSize: number;
    fontFamily: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    isBold: boolean;
    isUnderline: boolean;
  };
  signatoriesFormat: {
    fontSize: number;
    fontFamily: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    isBold: boolean;
    isUnderline: boolean;
  };
  attestedByFormat: {
    fontSize: number;
    fontFamily: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    isBold: boolean;
    isUnderline: boolean;
  };
}

const signatorySchema = new Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  optionalText: { type: String },
  alignment: { 
    type: String, 
    enum: ['Left', 'Center', 'Right', 'Justify'], 
    default: 'Left' 
  },
  isBold: { type: Boolean, default: false },
  isUnderline: { type: Boolean, default: true },
  fontSize: { type: Number, default: 14 },
  fontFamily: { type: String, default: 'Arial' },
  signature: { type: String }
}, { _id: false });

const formatSchema = new Schema({
  fontSize: { type: Number, default: 12 },
  fontFamily: { type: String, default: 'Arial' },
  alignment: { 
    type: String, 
    enum: ['Left', 'Center', 'Right', 'Justify'], 
    default: 'Left' 
  },
  isBold: { type: Boolean, default: false },
  isUnderline: { type: Boolean, default: false }
}, { _id: false });

const resolutionSchema = new Schema<IResolution>({
  resolutionNumber: {
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
    required: false,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  secondContent: {
    type: String
  },
  present: [{
    name: { type: String, required: true },
    position: { type: String, required: true }
  }],
  absent: [{
    name: { type: String, required: true },
    position: { type: String, required: true }
  }],
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'ResolutionTemplate'
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
  attestedBy: [signatorySchema],
  author: {
    type: String
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
  },
  presentFormat: {
    type: formatSchema,
    default: () => ({})
  },
  absentFormat: {
    type: formatSchema,
    default: () => ({})
  },
  secondContentFormat: {
    type: formatSchema,
    default: () => ({})
  },
  signatoriesFormat: {
    type: formatSchema,
    default: () => ({})
  },
  attestedByFormat: {
    type: formatSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

export default mongoose.model<IResolution>('Resolution', resolutionSchema);
