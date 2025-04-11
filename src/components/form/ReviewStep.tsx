
import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { PROBLEM_TYPES, SUPPORT_METHODS, URGENCY_LEVELS } from "@/constants/supportForm";

const ReviewStep = () => {
  const { formData, prevStep, submitForm, isSubmitting } = useSupportForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const renderSection = (title: string, content: JSX.Element) => (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-700 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        {title}
      </h3>
      <div className="pl-6">{content}</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="step-container">
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Review Your Support Request</h2>
          
          <div className="space-y-6 text-sm">
            {renderSection("Client Information", (
              <>
                <p><span className="font-medium">Name:</span> {formData.name}</p>
                <p><span className="font-medium">Email:</span> {formData.email}</p>
                {formData.phone && <p><span className="font-medium">Phone:</span> {formData.phone}</p>}
              </>
            ))}
            
            {renderSection("Device Information", (
              <>
                <p><span className="font-medium">Device Model:</span> {formData.deviceModel}</p>
                <p><span className="font-medium">Serial Number:</span> {formData.serialNumber}</p>
                <p><span className="font-medium">Firmware Version:</span> {formData.firmwareVersion}</p>
              </>
            ))}
            
            {renderSection("Issue Description", (
              <>
                <p><span className="font-medium">Problem Type:</span> {PROBLEM_TYPES[formData.problemType]}</p>
                <p className="whitespace-pre-wrap"><span className="font-medium">Description:</span> {formData.issueDescription}</p>
                {formData.errorMessage && (
                  <p className="whitespace-pre-wrap"><span className="font-medium">Error Message:</span> {formData.errorMessage}</p>
                )}
                {formData.stepsToReproduce && (
                  <p className="whitespace-pre-wrap"><span className="font-medium">Steps to Reproduce:</span> {formData.stepsToReproduce}</p>
                )}
              </>
            ))}
            
            {renderSection("Support Request", (
              <>
                <p><span className="font-medium">Support Method:</span> {SUPPORT_METHODS[formData.supportMethod]}</p>
                <p><span className="font-medium">Urgency Level:</span> {URGENCY_LEVELS[formData.urgencyLevel]}</p>
              </>
            ))}
            
            {formData.attachments && formData.attachments.length > 0 && (
              renderSection("Attachments", (
                <>
                  <p><span className="font-medium">Files:</span> {formData.attachments.length} file(s) attached</p>
                  <ul className="list-disc pl-5">
                    {formData.attachments.map((file, index) => (
                      <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                    ))}
                  </ul>
                </>
              ))
            )}
          </div>
          
          <div className="bg-support-light-blue/30 p-4 rounded-md flex gap-3">
            <AlertCircle className="h-5 w-5 text-support-blue flex-shrink-0 mt-0.5" />
            <p className="text-sm">Please review all information before submitting. Once submitted, our support team will contact you via your preferred method.</p>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              onClick={prevStep}
              variant="outline"
              className="border-support-light-blue"
            >
              Previous
            </Button>
            <Button 
              type="submit" 
              className="bg-support-blue hover:bg-support-dark-blue text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Support Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ReviewStep;
