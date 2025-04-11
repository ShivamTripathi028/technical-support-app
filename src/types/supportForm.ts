// src/types/supportForm.ts

export type ProblemType =
  | 'connectivity'
  | 'installation'
  | 'configuration'
  | 'hardware'
  | 'software'
  | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type SupportMethod = 'email' | 'phone' | 'remote'; // Assuming this is still needed, remove if not used

export interface SupportFormData {
  // Client Information
  name: string;
  company?: string;
  email: string;
  phone?: string;

  // Device Information
  deviceModel: string;
  serialNumber: string;  // Still represents EUI, but now optional for validation in DeviceInfoStep
  firmwareVersion?: string;

  // Issue Description
  problemType: ProblemType;
  issueDescription: string;
  errorMessage?: string;
  // errorScreenshots?: File[]; // REMOVED
  stepsToReproduce?: string;
  previousTicketId?: string; // ADDED

  // Support Request Details (Typically collected in IssueDescriptionStep or a separate step)
  supportMethod: SupportMethod; // Keep based on last provided context, adjust if step was removed
  urgencyLevel: UrgencyLevel;

  // File Upload (Combined)
  attachments?: File[]; // For combined upload field

  // Consent
  privacyAgreed: boolean; // Keep based on last provided context, adjust if step was removed

  // Field for confirmation page
  submittedTicketId?: number | string | null;
}

// Define the valid steps in the form flow
export type FormStep =
  | 'clientInfo'
  | 'deviceInfo'
  | 'issueDescription'
  | 'review'
  | 'confirmation';