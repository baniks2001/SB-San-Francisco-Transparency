import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  systemName: string;
  systemLogo?: string;
  systemLogos: string[];
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  aboutOffice?: string;
  mission?: string;
  vision?: string;
  keyResponsibilities?: string;
  contactInfo?: {
    mobileNumbers: string[];
    email: string;
    address: string;
  };
  location?: string;
  transparencyTitle?: string;
  officialSeal?: {
    image: string;
    title: string;
    description: string;
  };
  officeHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  organizationStructure: Array<{
    name: string;
    position: string;
    image?: string;
    order: number;
  }>;
  carouselImages: string[];
  projectImages: Array<{
    projectName: string;
    details: string;
    image: string;
  }>;
  announcements: Array<{
    title: string;
    content: string;
    image?: string;
    priority: 'Urgent' | 'Normal' | 'Low';
    createdAt: Date;
  }>;
  copyrightText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const themeColorsSchema = new Schema({
  primary: { type: String, default: '#F59E0B' },
  secondary: { type: String, default: '#92400E' },
  accent: { type: String, default: '#FFFFFF' },
  background: { type: String, default: '#FFFFFF' }
}, { _id: false });

const contactInfoSchema = new Schema({
  mobileNumbers: [{ type: String }],
  email: { type: String, required: true },
  address: { type: String, required: true }
}, { _id: false });

const orgStructureSchema = new Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  image: { type: String },
  order: { type: Number, required: true }
}, { _id: false });

const officeHoursSchema = new Schema({
  monday: { type: String, default: '8:00 AM - 5:00 PM' },
  tuesday: { type: String, default: '8:00 AM - 5:00 PM' },
  wednesday: { type: String, default: '8:00 AM - 5:00 PM' },
  thursday: { type: String, default: '8:00 AM - 5:00 PM' },
  friday: { type: String, default: '8:00 AM - 5:00 PM' },
  saturday: { type: String, default: '8:00 AM - 12:00 PM' },
  sunday: { type: String, default: 'Closed' }
}, { _id: false });

const projectImageSchema = new Schema({
  image: { type: String, required: true },
  projectName: { type: String, required: true },
  details: { type: String, required: true }
}, { _id: false });

const systemSettingsSchema = new Schema<ISystemSettings>({
  systemName: {
    type: String,
    default: 'Sangguniang Bayan Transparency Portal'
  },
  systemLogo: {
    type: String,
    default: ''
  },
  systemLogos: [{ type: String, default: () => [] }],
  themeColors: {
    type: themeColorsSchema,
    default: () => ({})
  },
  aboutOffice: {
    type: String,
    default: ''
  },
  mission: {
    type: String,
    default: ''
  },
  vision: {
    type: String,
    default: ''
  },
  keyResponsibilities: {
    type: String,
    default: ''
  },
  contactInfo: {
    type: contactInfoSchema,
    default: () => ({ mobileNumbers: [], email: '', address: '' })
  },
  location: {
    type: String,
    default: 'San Francisco, Southern Leyte'
  },
  transparencyTitle: {
    type: String,
    default: 'Sangguniang Bayan Transparency'
  },
  officialSeal: {
    image: { type: String, default: '' },
    title: { type: String, default: 'Official Seal of Sangguniang Bayan' },
    description: { type: String, default: 'The official seal represents the authority, integrity, and commitment of the Sangguniang Bayan in serving the people of our municipality with dedication and excellence.' }
  },
  officeHours: {
    type: officeHoursSchema,
    default: () => ({})
  },
  organizationStructure: [orgStructureSchema],
  carouselImages: [{ type: String }],
  projectImages: [projectImageSchema],
  announcements: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    priority: { type: String, enum: ['Urgent', 'Normal', 'Low'], default: 'Normal' },
    createdAt: { type: Date, default: Date.now }
  }],
  copyrightText: {
    type: String,
    default: `© ${new Date().getFullYear()} Sangguniang Bayan, San Francisco, Southern Leyte. All rights reserved.`
  }
}, {
  timestamps: true
});

export default mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
