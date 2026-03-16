export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  profileImage?: string;
  permissions: string[];
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Resolution {
  _id: string;
  resolutionNumber: string;
  series: string;
  title: string;
  content: string;
  secondContent?: string;
  present?: Array<{name: string, position: string, position2?: string}>;
  absent?: Array<{name: string, position: string, position2?: string}>;
  templateId?: string | { _id: string; templateName: string }; // Can be string ID or populated template object
  status: 'Draft' | 'Pending' | 'Approved';
  isPublic: boolean;
  scannedCopy?: string;
  signatories: Signatory[];
  author: string;
  dateIntroduced: string;
  dateApproved?: string;
  paperSize: string;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ordinance {
  _id: string;
  ordinanceNumber: string;
  series: string;
  title: string;
  content: string;
  templateId?: string;
  status: 'Draft' | 'Pending' | 'Approved';
  isPublic: boolean;
  scannedCopy?: string;
  signatories: Signatory[];
  author: string;
  dateIntroduced: string;
  dateApproved?: string;
  paperSize: string;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Signatory {
  name: string;
  position: string;
  alignment: 'Left' | 'Center' | 'Right' | 'Justify';
  isBold?: boolean;
  isUnderline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  signature?: string;
}

export interface Procurement {
  _id: string;
  procurementNumber: string;
  title: string;
  description: string;
  amount: number;
  status: 'Draft' | 'Pending' | 'Approved';
  isPublic: boolean;
  documentFile?: string;
  datePosted: string;
  dateApproved?: string;
  procurementType: string;
  supplier?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  budgetNumber: string;
  title: string;
  description: string;
  totalAmount: number;
  allocatedAmount: number;
  status: 'Draft' | 'Pending' | 'Approved';
  isPublic: boolean;
  documentFile?: string;
  fiscalYear: string;
  department: string;
  datePosted: string;
  dateApproved?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vacancy {
  _id: string;
  jobTitle: string;
  position: string;
  estimatedSalary: number;
  jobDescription: string;
  qualifications: string;
  requirements: string;
  status: 'Active' | 'Closed';
  datePosted: string;
  closingDate?: string;
  department: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  vacancyId: string;
  fullName: string;
  age: number;
  mobileNumber: string;
  email: string;
  address: string;
  resume?: string;
  certificates?: string[];
  status: 'Under Review' | 'Hired' | 'Rejected';
  dateApplied: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'Urgent' | 'Normal' | 'Low';
  documentFile?: string;
  isActive: boolean;
  datePosted: string;
  expiryDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  _id: string;
  systemName: string;
  systemLogo: string;
  systemLogos: string[]; // Array to support multiple logos
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  aboutOffice: string;
  mission: string;
  vision: string;
  keyResponsibilities: string;
  contactInfo: {
    mobileNumbers: string[];
    email: string;
    address: string;
    facebook?: string;
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
    createdAt: string;
  }>;
  copyrightText?: string;
  mapLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResolutionTemplate {
  _id: string;
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
  paperSize: string;
  defaultPageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}
