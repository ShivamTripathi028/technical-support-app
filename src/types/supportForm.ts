
export type ProblemType = 
  | 'connectivity' 
  | 'installation' 
  | 'configuration' 
  | 'hardware' 
  | 'software' 
  | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type SupportMethod = 'email' | 'phone' | 'remote';

export interface SupportFormData {
  // Client Information
  name: string;
  company?: string;
  email: string;
  phone?: string;
  
  // Device Information
  deviceModel: string;
  serialNumber: string;  // This will store the EUI Number
  firmwareVersion?: string;
  
  // Issue Description
  problemType: ProblemType;
  issueDescription: string;
  errorMessage?: string;
  errorScreenshots?: File[];
  stepsToReproduce?: string;
  
  // Support Request
  supportMethod: SupportMethod;
  urgencyLevel: UrgencyLevel;
  
  // File Upload
  attachments?: File[];
  
  // Consent
  privacyAgreed: boolean;
}

export type FormStep = 
  | 'clientInfo'
  | 'deviceInfo'
  | 'issueDescription'
  | 'review'
  | 'confirmation';
