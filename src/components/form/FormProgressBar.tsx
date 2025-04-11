// src/components/form/FormProgressBar.tsx
import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { FormStep } from "@/types/supportForm";
import { Check } from "lucide-react"; // Import Check icon

interface StepInfo {
  label: string;
  value: FormStep;
  // Icon definition removed as we now use index/checkmark
}

const FormProgressBar = () => {
  const { currentStep, goToStep, formData } = useSupportForm(); // Removed unused stepProgress

  // Define steps for the progress bar (excluding confirmation step)
  const steps: StepInfo[] = [
    { label: "Client Info", value: "clientInfo" },
    { label: "Device Info", value: "deviceInfo" },
    { label: "Issue Details", value: "issueDescription" },
    { label: "Review", value: "review" },
  ];

  const currentVisibleStepIndex = steps.findIndex(s => s.value === currentStep);

  // *** FIX: Implement the canGoToStep function logic ***
  const canGoToStep = (targetStepIndex: number): boolean => {
    const currentIdx = steps.findIndex(s => s.value === currentStep);

    // Cannot navigate forward using the progress bar directly
    if (targetStepIndex > currentIdx) {
        return false;
    }

    // Can always go to the first step
    if (targetStepIndex === 0) return true;

    // Check if previous steps are valid enough to allow navigation back
    // This validation ensures data exists before allowing navigation to a step that depends on it.
    if (targetStepIndex >= 1 && (!formData.name || !formData.email)) {
      // Need client info to proceed to device info or beyond
      return false;
    }
    if (targetStepIndex >= 2 && (!formData.deviceModel || !formData.serialNumber)) {
      // Need device info to proceed to issue description or beyond
      return false;
    }
     if (targetStepIndex >= 3 && (!formData.issueDescription || !formData.urgencyLevel)) {
      // Need issue description and urgency to proceed to review
      return false;
    }
    // Add more checks here if future steps have mandatory prerequisites

    return true; // If all prerequisite checks pass for the target step
  };
  // *** END FIX ***

  // Don't show progress bar on confirmation page
  if (currentStep === "confirmation") {
    return null;
  }

  // --- Calculate progress for mobile bar ---
  // Base progress on the current visible step index relative to the total number of visible steps
  const totalVisibleSteps = steps.length;
  const mobileProgress = Math.min(100, Math.round(((currentVisibleStepIndex + 1) / totalVisibleSteps) * 100)); // +1 because index is 0-based

  return (
    <div className="mb-8"> {/* Increased bottom margin */}
      {/* Progress bar for mobile */}
      <div className="block sm:hidden mb-4">
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner"> {/* Slightly thicker bar */}
          <div
            className="h-full bg-support-blue rounded-full transition-all duration-500 ease-out" // Added transition
            style={{ width: `${mobileProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-600 font-medium">
          <span>{steps[currentVisibleStepIndex]?.label || 'Start'}</span>
          <span>{currentVisibleStepIndex + 1} / {totalVisibleSteps}</span>
        </div>
      </div>

      {/* Full progress bar for larger screens */}
      <div className="hidden sm:flex justify-between items-start">
        {steps.map((step, index) => {
          const isActive = step.value === currentStep;
          const isPast = currentVisibleStepIndex > index;
          const isClickable = canGoToStep(index);

          return (
            // Use div with "contents" to avoid breaking flex layout while allowing data attributes
            <div key={step.value} className="contents">
              {/* Step circle and label container */}
              <div className="flex flex-col items-center text-center flex-shrink-0 w-20"> {/* Fixed width for better alignment */}
                <button
                  type="button"
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm mb-1.5 transition-all duration-200 border-2 ${ // Added border
                    isActive
                      ? "bg-support-blue text-white border-support-blue ring-2 ring-offset-2 ring-support-blue/50" // Active style
                      : isPast
                      ? "bg-support-blue text-white border-support-blue" // Completed style
                      : isClickable
                      ? "bg-white text-support-blue border-support-blue hover:bg-support-blue/10" // Clickable future step
                      : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed" // Disabled future step
                  } ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
                  onClick={() => isClickable && goToStep(step.value)}
                  disabled={!isClickable}
                  aria-label={`Go to step ${index + 1}: ${step.label}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isPast ? <Check className="w-5 h-5" /> : index + 1} {/* Show checkmark */}
                </button>
                <span className={`text-xs w-full truncate px-1 ${isActive ? "font-semibold text-support-blue" : "text-gray-600"}`}>{step.label}</span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center pt-4 mx-1"> {/* Align line with center */}
                  <div
                    className={`h-1 w-full transition-colors duration-300 rounded ${ // Slightly thicker, rounded line
                      isPast ? "bg-support-blue" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormProgressBar;