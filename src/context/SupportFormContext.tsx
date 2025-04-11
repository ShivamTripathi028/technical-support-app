// src/context/SupportFormContext.tsx

import React, { createContext, useState, useContext, ReactNode } from "react";
import { FormStep, SupportFormData } from "../types/supportForm";
import { toast } from "@/hooks/use-toast";

interface SupportFormContextType {
  formData: SupportFormData;
  currentStep: FormStep;
  updateFormData: (data: Partial<SupportFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: FormStep) => void;
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
  stepProgress: number;
  downloadSummary: () => void;
}

const defaultFormData: SupportFormData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  deviceModel: "",
  serialNumber: "",
  firmwareVersion: "",
  problemType: "connectivity", // Default problem type
  issueDescription: "",
  errorMessage: "",
  // errorScreenshots: [], // REMOVED
  stepsToReproduce: "",
  previousTicketId: "", // ADDED default
  supportMethod: "email", // Default support method
  urgencyLevel: "medium", // Default urgency
  attachments: [], // Initialize combined attachments
  privacyAgreed: false, // Default consent state
  submittedTicketId: null, // Initialize submitted ticket ID
};

// Define the order of steps
const steps: FormStep[] = [
  "clientInfo",
  "deviceInfo",
  "issueDescription",
  "review",
  "confirmation"
];

// Define the path to your Netlify function
const API_ENDPOINT = "/.netlify/functions/support-ticket";

const SupportFormContext = createContext<SupportFormContextType | undefined>(undefined);

export const SupportFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<SupportFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState<FormStep>("clientInfo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = steps.indexOf(currentStep);
  const activeProgressBarSteps = steps.length - 2; // Client, Device, Issue, Review
  const currentProgressBarIndex = Math.min(currentStepIndex, activeProgressBarSteps);
  const stepProgress = currentProgressBarIndex === activeProgressBarSteps
    ? 100
    : Math.round((currentProgressBarIndex / activeProgressBarSteps) * 100);

  const updateFormData = (data: Partial<SupportFormData>) => {
    const updatedData = { ...data };
    // Ensure file arrays are always arrays if being set
    if ('attachments' in data && !Array.isArray(data.attachments) && data.attachments !== undefined) {
        updatedData.attachments = []; // Reset if invalid type provided, keep if undefined
    }
    // No need to check errorScreenshots anymore
    setFormData((prev) => ({ ...prev, ...updatedData }));
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentStep === 'confirmation') return; // Don't go back from confirmation
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

 const goToStep = (step: FormStep) => {
    // Reset form if navigating back to the first step from a later step
    if (step === 'clientInfo' && currentStep !== 'clientInfo') {
        console.log("Navigating back to first step, resetting form data.");
        setFormData(defaultFormData); // Reset includes submittedTicketId: null
        setCurrentStep('clientInfo');
    } else if (steps.includes(step) && step !== 'confirmation') { // Prevent direct navigation to confirmation
      // Check if navigation is allowed based on current data (using logic similar to canGoToStep in progress bar)
       const targetStepIndex = steps.indexOf(step);
       let canNavigate = true;
       if (targetStepIndex >= 1 && (!formData.name || !formData.email)) canNavigate = false;
       if (targetStepIndex >= 2 && !formData.deviceModel) canNavigate = false; // Only model required now
       if (targetStepIndex >= 3 && (!formData.issueDescription || !formData.urgencyLevel)) canNavigate = false;

       if(canNavigate) {
          setCurrentStep(step);
       } else {
           console.warn(`Cannot navigate to step "${step}" yet. Prerequisite data missing.`);
           toast({ title: "Cannot Navigate", description: "Please complete previous steps first.", variant: "destructive"});
       }
    }
     window.scrollTo(0, 0);
  };

  const submitForm = async () => {
    if (currentStep !== 'review') {
        console.warn("Submit called from incorrect step:", currentStep);
        toast({ title: "Cannot Submit", description: "Please complete all steps before submitting.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    updateFormData({ submittedTicketId: null }); // Clear previous ID

    // Prepare data, sending file arrays so backend can check their length
    const dataToSend = { ...formData };
    // Ensure arrays are sent, even if empty
    dataToSend.attachments = dataToSend.attachments || [];
    // delete dataToSend.errorScreenshots; // REMOVED
    delete dataToSend.submittedTicketId; // Don't send the previous ID

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok && response.status === 201 && result.success) {
        console.log("Form submission successful:", result);
        updateFormData({ submittedTicketId: result.ticketId || null }); // Store actual ID
        setCurrentStep("confirmation");
        window.scrollTo(0, 0);
        toast({ title: "Support Request Submitted!", description: result.message || "Our team will review your request shortly.", duration: 7000 });
      } else {
         console.error("Submission Error:", response.status, result);
        toast({ title: "Submission Failed", description: result.message || `An error occurred (Status: ${response.status}). Please review your submission or try again.`, variant: "destructive", duration: 9000 });
      }
    } catch (error) {
       console.error("Network or Fetch Error submitting form:", error);
        toast({ title: "Network Error", description: "Could not send your request. Please check your connection and try again.", variant: "destructive", duration: 9000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSummary = () => {
    const summaryData = { ...formData };
    // Represent file info, not the File objects themselves
    summaryData.attachments = formData.attachments?.map(f => ({ name: f.name, size: f.size, type: f.type })) || [];
    // delete summaryData.errorScreenshots; // REMOVED

    const dataStr = JSON.stringify(summaryData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const clientName = formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'user';
    const exportName = `rak_support_summary_${clientName}_${new Date().toISOString().slice(0,10)}`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", `${exportName}.json`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);

    toast({ title: "Summary Downloaded", description: "Your request summary has been saved as a JSON file.", duration: 5000 });
  };


  return (
    <SupportFormContext.Provider
      value={{
        formData,
        currentStep,
        updateFormData,
        nextStep,
        prevStep,
        goToStep,
        submitForm,
        isSubmitting,
        stepProgress,
        downloadSummary
      }}
    >
      {children}
    </SupportFormContext.Provider>
  );
};

export const useSupportForm = () => {
  const context = useContext(SupportFormContext);
  if (context === undefined) {
    throw new Error("useSupportForm must be used within a SupportFormProvider");
  }
  return context;
};