// src/context/SupportFormContext.tsx

import React, { createContext, useState, useContext, ReactNode } from "react";
import { FormStep, SupportFormData } from "../types/supportForm";
import { toast } from "@/hooks/use-toast"; // Using the shadcn toast hook

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
  serialNumber: "",  // This will store the EUI Number
  firmwareVersion: "",
  problemType: "connectivity",
  issueDescription: "",
  errorMessage: "",
  errorScreenshots: [],
  stepsToReproduce: "",
  supportMethod: "email",
  urgencyLevel: "medium",
  attachments: [],
  privacyAgreed: false
};

const steps: FormStep[] = [
  "clientInfo",
  "deviceInfo",
  "issueDescription",
  "review",
  "confirmation"
];

// --- Define the path to your Netlify function ---
const API_ENDPOINT = "/.netlify/functions/support-ticket"; // Updated endpoint name
// --- End Netlify Function Path ---

const SupportFormContext = createContext<SupportFormContextType | undefined>(undefined);

export const SupportFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<SupportFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState<FormStep>("clientInfo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = steps.indexOf(currentStep);
  // Progress calculation based on visual steps (Client to Review are the 4 progress points)
  const activeProgressBarSteps = steps.length - 2; // Client, Device, Issue, Review
  const currentProgressBarIndex = Math.min(currentStepIndex, activeProgressBarSteps); // Cap index at the last visual step
  // Calculate progress out of 100, ensuring it reaches 100 only when review step is active/passed
  const stepProgress = currentProgressBarIndex === activeProgressBarSteps
    ? 100
    : Math.round((currentProgressBarIndex / activeProgressBarSteps) * 100);

  const updateFormData = (data: Partial<SupportFormData>) => {
    // Clear attachments/screenshots if data is explicitly set to null/undefined, otherwise update
    const updatedData = { ...data };
    if ('attachments' in data && !data.attachments) {
        updatedData.attachments = [];
    }
     if ('errorScreenshots' in data && !data.errorScreenshots) {
        updatedData.errorScreenshots = [];
    }

    setFormData((prev) => ({ ...prev, ...updatedData }));
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      window.scrollTo(0, 0); // Scroll to top on step change
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    // Prevent going back from confirmation page using 'prev' button
    if (currentStep === 'confirmation') return;

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      window.scrollTo(0, 0); // Scroll to top on step change
    }
  };

 const goToStep = (step: FormStep) => {
    // Reset form if navigating back to the first step from a later step
    if (step === 'clientInfo' && currentStep !== 'clientInfo') {
        // Optionally add a confirmation dialog here if needed
        console.log("Navigating back to first step, resetting form data.");
        setFormData(defaultFormData);
        setCurrentStep('clientInfo');
    } else if (steps.includes(step) && step !== 'confirmation') { // Prevent direct navigation to confirmation
      setCurrentStep(step);
    }
     window.scrollTo(0, 0); // Scroll to top on step change
  };

  const submitForm = async () => {
    // Ensure we are on the review step before submitting
    if (currentStep !== 'review') {
        console.warn("Submit called from incorrect step:", currentStep);
        toast({
            title: "Cannot Submit",
            description: "Please complete all steps before submitting.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);

    // --- Prepare data for submission ---
    // Create a plain object, excluding File objects
    const dataToSend = { ...formData };
    delete dataToSend.attachments; // Remove file arrays before sending
    delete dataToSend.errorScreenshots; // Remove file arrays before sending

    try {
      // --- Make the actual API call to the Netlify function ---
      const response = await fetch(API_ENDPOINT, { // Use the constant
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), // Send the cleaned data
      });

      // --- Handle the response ---
      const result = await response.json(); // Parse JSON response body

      if (response.ok && response.status === 201) { // Check for 201 Created status
        console.log("Form submission successful:", result);
        updateFormData({ submittedTicketId: result.ticketId || null });
        // --- Success ---
        setCurrentStep("confirmation"); // Move to confirmation step
        window.scrollTo(0, 0); // Scroll to top
        toast({
          title: "Support Request Submitted!",
          description: result.message || "Our team will review your request shortly.",
          variant: "default", // Use default success style
          duration: 7000,
        });
        // Optionally store ticket ID if needed for confirmation page
        // updateFormData({ submittedTicketId: result.ticketId });
      } else {
        // --- Handle errors from the backend ---
        console.error("Submission Error:", response.status, result);
        toast({
          title: "Submission Failed",
          description: result.message || `An error occurred (Status: ${response.status}). Please review your submission or try again.`,
          variant: "destructive", // Use destructive variant for errors
          duration: 9000,
        });
        // Keep the user on the review step to allow corrections or retry
      }
    } catch (error) {
      // --- Handle network errors or issues reaching the function ---
      console.error("Network or Fetch Error submitting form:", error);
      toast({
        title: "Network Error",
        description: "Could not send your request due to a network issue. Please check your connection and try again.",
        variant: "destructive",
        duration: 9000,
      });
       // Keep the user on the review step
    } finally {
      setIsSubmitting(false); // Reset loading state regardless of outcome
    }
  };

  // Function to download form data as JSON (excluding files)
  const downloadSummary = () => {
    // Exclude file objects from the summary download
    const summaryData = { ...formData };
    delete summaryData.attachments;
    delete summaryData.errorScreenshots;

    const dataStr = JSON.stringify(summaryData, null, 2); // Pretty print JSON
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const clientName = formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'user';
    const exportName = `rak_support_summary_${clientName}_${new Date().toISOString().slice(0,10)}`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", `${exportName}.json`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement); // Clean up the link
    URL.revokeObjectURL(url); // Free up memory

    toast({ // Notify user
        title: "Summary Downloaded",
        description: "Your request summary has been saved as a JSON file.",
        duration: 5000,
    });
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

// Export hook as before
export const useSupportForm = () => {
  const context = useContext(SupportFormContext);
  if (context === undefined) {
    throw new Error("useSupportForm must be used within a SupportFormProvider");
  }
  return context;
};