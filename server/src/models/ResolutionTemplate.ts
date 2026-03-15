import mongoose, { Document, Schema } from 'mongoose';

export interface IResolutionTemplate extends Document {
  templateName: string;
  header: {
    logos: Array<{
      id: string;
      url: string;
      name?: string;
    }>;
    texts: Array<{
      id: string;
      text: string;
      fontSize: number;
      fontFamily: string;
      fontColor: string;
      alignment: 'Left' | 'Center' | 'Right' | 'Justify';
      isBold?: boolean;
      isUnderline?: boolean;
      isItalic?: boolean;
    }>;
    backgroundColor?: string;
  };
  footer: {
    texts: Array<{
      id: string;
      text: string;
      fontSize: number;
      fontFamily: string;
      fontColor: string;
      alignment: 'Left' | 'Center' | 'Right' | 'Justify';
      isBold?: boolean;
      isUnderline?: boolean;
      isItalic?: boolean;
    }>;
    backgroundColor?: string;
  };
  content: string;
  defaultSignatories: Array<{
    name: string;
    position: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    isBold?: boolean;
    isUnderline?: boolean;
  }>;
  paperSize: string;
  defaultPageCount: number;
  createdBy: mongoose.Types.ObjectId;
}

const logoSchema = new Schema({
  id: { type: String, required: true },
  url: { type: String, required: true },
  name: { type: String }
}, { _id: false });

const textSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  fontSize: { type: Number, required: true },
  fontFamily: { type: String, required: true },
  fontColor: { type: String, required: true },
  alignment: { 
    type: String, 
    enum: ['Left', 'Center', 'Right', 'Justify'], 
    default: 'Center' 
  },
  isBold: { type: Boolean, default: false },
  isUnderline: { type: Boolean, default: false },
  isItalic: { type: Boolean, default: false }
}, { _id: false });

const headerSchema = new Schema({
  logos: [logoSchema],
  texts: [textSchema],
  backgroundColor: { type: String }
}, { _id: false });

const footerSchema = new Schema({
  texts: [textSchema],
  backgroundColor: { type: String }
}, { _id: false });

const defaultSignatorySchema = new Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  alignment: { 
    type: String, 
    enum: ['Left', 'Center', 'Right', 'Justify'], 
    default: 'Left' 
  },
  isBold: { type: Boolean, default: false },
  isUnderline: { type: Boolean, default: true }
}, { _id: false });

const resolutionTemplateSchema = new Schema<IResolutionTemplate>({
  templateName: {
    type: String,
    required: true,
    trim: true
  },
  header: {
    type: headerSchema,
    required: true
  },
  footer: {
    type: footerSchema,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  defaultSignatories: [defaultSignatorySchema],
  paperSize: {
    type: String,
    default: 'A4'
  },
  defaultPageCount: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IResolutionTemplate>('ResolutionTemplate', resolutionTemplateSchema);
