// src/components/form/ReviewStep.tsx

import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, AlertCircle, Info, User, Cpu, MessageSquare, HelpCircle } from "lucide-react"; // Changed icons
import { PROBLEM_TYPES, URGENCY_LEVELS } from "@/constants/supportForm";
// Assuming SUPPORT_METHODS is still needed for display, if not, remove import and usage
// import { SUPPORT_METHODS } from "@/constants/supportForm";

const ReviewStep = () => {
  const { formData, prevStep, submitForm, isSubmitting, downloadSummary } = useSupportForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  // Helper to render a field only if it has a value
  const renderField = (label: string, value: string | undefined | null) => {
    // Trim value if it's a string before checking
    const displayValue = typeof value === 'string' ? value.trim() : value;
    if (!displayValue) return null;
    return <p><span className="font-medium text-gray-600">{label}:</span> {displayValue}</p>;
  };

   // Helper to render a text area field, handling line breaks
  const renderTextAreaField = (label: string, value: string | undefined | null) => {
    if (!value || value.trim() === '') return null;
    return (
      <div className="mt-2">
        <p className="font-medium text-gray-600">{label}:</p>
        {/* Use a div with whitespace-pre-wrap for better control over presentation */}
        <div className="whitespace-pre-wrap pl-1 pt-1 text-gray-800">{value}</div>
      </div>
    );
  };

  // Render section only if it contains renderable content
  const renderSection = (title: string, icon: React.ReactNode, content: JSX.Element[] | null) => {
     const validChildren = React.Children.toArray(content).filter(child => child !== null);
     if (!validChildren || validChildren.length === 0) {
         return null; // Don't render section if no valid children
     }
    return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0">
      <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2 mb-2">
        {icon}
        {title}
      </h3>
      <div className="pl-7 space-y-1.5">{validChildren}</div> {/* Indent content */}
    </div>
  )};

  return (
    <form onSubmit={handleSubmit} className="step-container">
      <Card className="border-support-light-blue shadow-lg"> {/* Increased shadow */}
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Review Your Support Request</h2>

          <div className="space-y-5 text-sm bg-gray-50 p-4 md:p-6 rounded-lg border"> {/* Added background and padding */}
            {renderSection("Client Information", <User className="w-5 h-5 text-support-blue" />, [
                renderField("Name", formData.name),
                renderField("Email", formData.email),
                renderField("Company", formData.company),
                renderField("Phone", formData.phone),
            ])}

            {renderSection("Device Information", <Cpu className="w-5 h-5 text-support-blue" />, [
                renderField("Device Model", formData.deviceModel),
                renderField("Device EUI Number", formData.serialNumber),
                renderField("Firmware Version", formData.firmwareVersion),
            ])}

            {renderSection("Issue Details", <MessageSquare className="w-5 h-5 text-support-blue" />, [
                renderField("Problem Type", PROBLEM_TYPES[formData.problemType]),
                renderTextAreaField("Description", formData.issueDescription),
                renderField("Previous Ticket ID", formData.previousTicketId), // Display Previous Ticket ID
                renderTextAreaField("Error Message", formData.errorMessage),
                renderTextAreaField("Steps to Reproduce", formData.stepsToReproduce),
                renderField("Urgency Level", URGENCY_LEVELS[formData.urgencyLevel]),
                // Removed support method display as it wasn't in the form steps provided
                // renderField("Preferred Support", SUPPORT_METHODS[formData.supportMethod])
            ])}

            {/* MODIFIED: Combined Attachments section */}
            {formData.attachments && formData.attachments.length > 0 && (
              renderSection("Uploaded Files", <FileText className="w-5 h-5 text-support-blue" />, [
                <ul key="attachment-list" className="list-disc space-y-1 pl-5">
                  {formData.attachments.map((file, index) => (
                    <li key={index} className="break-words">
                      {file.name} <span className="text-gray-500 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                    </li>
                  ))}
                </ul>
              ])
            )}
          </div>

          {/* Notice */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md flex gap-3 mt-6">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">Please review all information carefully before submitting. Ensure you have agreed to the privacy terms (implied by reaching this step).</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t mt-6 gap-3">
            <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
            >
              Go Back & Edit
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                 <Button
                    type="button"
                    onClick={downloadSummary}
                    variant="outline"
                    className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                >
                  Download Summary
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-support-blue hover:bg-support-dark-blue text-white disabled:bg-gray-400" // Added disabled style
                  disabled={isSubmitting}
                  aria-disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Support Request"}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ReviewStep;