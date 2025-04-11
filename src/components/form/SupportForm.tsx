
import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import ClientInfoStep from "./ClientInfoStep";
import DeviceInfoStep from "./DeviceInfoStep";
import IssueDescriptionStep from "./IssueDescriptionStep";
import ReviewStep from "./ReviewStep";
import ConfirmationStep from "./ConfirmationStep";
import FormProgressBar from "./FormProgressBar";

const SupportForm = () => {
  const { currentStep } = useSupportForm();

  const renderStep = () => {
    switch (currentStep) {
      case "clientInfo":
        return <ClientInfoStep />;
      case "deviceInfo":
        return <DeviceInfoStep />;
      case "issueDescription":
        return <IssueDescriptionStep />;
      case "review":
        return <ReviewStep />;
      case "confirmation":
        return <ConfirmationStep />;
      default:
        return <ClientInfoStep />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <FormProgressBar />
      {renderStep()}
    </div>
  );
};

export default SupportForm;
