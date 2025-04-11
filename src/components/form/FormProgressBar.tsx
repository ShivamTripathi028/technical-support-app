
import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { FormStep } from "@/types/supportForm";

interface StepInfo {
  label: string;
  value: FormStep;
  icon: React.ReactNode;
}

const FormProgressBar = () => {
  const { currentStep, stepProgress, goToStep, formData } = useSupportForm();

  // Define steps for the progress bar (excluding confirmation step)
  const steps: StepInfo[] = [
    {
      label: "Client",
      value: "clientInfo",
      icon: <div className="w-5 h-5 text-xs flex items-center justify-center">1</div>,
    },
    {
      label: "Device",
      value: "deviceInfo",
      icon: <div className="w-5 h-5 text-xs flex items-center justify-center">2</div>,
    },
    {
      label: "Issue",
      value: "issueDescription",
      icon: <div className="w-5 h-5 text-xs flex items-center justify-center">3</div>,
    },
    {
      label: "Review",
      value: "review",
      icon: <div className="w-5 h-5 text-xs flex items-center justify-center">4</div>,
    },
  ];

  // Helper function to determine if a step should be clickable
  const canGoToStep = (stepIndex: number): boolean => {
    // First step is always accessible
    if (stepIndex === 0) return true;
    
    // Client step requires name and email
    if (stepIndex >= 1 && (!formData.name || !formData.email)) {
      return false;
    }
    
    // Device step requires device model and serial
    if (stepIndex >= 2 && (!formData.deviceModel || !formData.serialNumber)) {
      return false;
    }
    
    // Issue step requires issue description
    if (stepIndex >= 3 && (!formData.issueDescription)) {
      return false;
    }
    
    return true;
  };

  // Don't show progress bar on confirmation page
  if (currentStep === "confirmation") {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Progress bar for mobile */}
      <div className="block sm:hidden mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-support-blue" 
            style={{ width: `${stepProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Step {steps.findIndex(s => s.value === currentStep) + 1}</span>
          <span>of {steps.length}</span>
        </div>
      </div>
      
      {/* Full progress bar for larger screens */}
      <div className="hidden sm:flex justify-between">
        {steps.map((step, index) => {
          const isActive = step.value === currentStep;
          const isPast = steps.findIndex(s => s.value === currentStep) > index;
          const isClickable = canGoToStep(index);
          
          return (
            <React.Fragment key={step.value}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-support-blue text-white"
                      : isPast
                      ? "bg-support-blue text-white"
                      : "bg-gray-200 text-gray-600"
                  } ${isClickable ? "cursor-pointer hover:opacity-90" : "cursor-not-allowed opacity-60"}`}
                  onClick={() => isClickable && goToStep(step.value)}
                  disabled={!isClickable}
                >
                  {step.icon}
                </button>
                <span className={`text-xs mt-1 ${isActive ? "font-bold" : ""}`}>{step.label}</span>
              </div>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center mx-2">
                  <div 
                    className={`h-0.5 w-full ${
                      isPast ? "bg-support-blue" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default FormProgressBar;
