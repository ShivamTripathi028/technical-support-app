// src/components/form/ConfirmationStep.tsx

import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, CalendarClock, Mail, Loader2 } from "lucide-react";

const ConfirmationStep = () => {
  // Get formData which now includes submittedTicketId
  const { formData, goToStep } = useSupportForm();

  const handleNewRequest = () => {
    // goToStep will trigger the state reset in the context provider
    goToStep("clientInfo");
  };

  // Get the actual ticket ID from the form data
  const actualTicketId = formData.submittedTicketId;

  return (
    <div className="step-container">
      <Card className="border-support-light-blue shadow-lg"> {/* Slightly increased shadow */}
        <CardContent className="pt-8 pb-8 space-y-8"> {/* Increased padding */}
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-20 w-20 text-green-500 mb-5" /> {/* Larger icon */}
            <h2 className="text-3xl font-semibold text-center mb-3 text-gray-800"> {/* Adjusted heading */}
              Support Request Submitted!
            </h2>
            <p className="text-gray-600 text-center mb-6 max-w-md"> {/* Adjusted text */}
              Thank you for contacting RAKwireless Technical Support. Your request is being processed.
            </p>
          </div>

          {/* Ticket Details Section */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg space-y-5">
            {/* Display Actual Ticket ID */}
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Your Ticket ID</p>
              <p className="font-bold text-2xl text-support-blue mt-1"> {/* Made ID larger and bold */}
                {actualTicketId ? `#${actualTicketId}` : <Loader2 className="h-6 w-6 animate-spin inline-block text-gray-500" />}
              </p>
              {actualTicketId && (
                 <p className="text-xs text-gray-500 mt-1">Please use this ID for any follow-up inquiries.</p>
              )}
            </div>

            {/* Separator */}
            <hr className="border-gray-200" />

            {/* Device Submitted For */}
             <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Device Model</p>
              <p className="font-medium text-gray-800 mt-1">{formData.deviceModel || "N/A"}</p>
            </div>

             {/* Separator */}
             <hr className="border-gray-200" />

             {/* Email Confirmation */}
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-support-blue flex-shrink-0" />
              <p className="font-medium text-gray-700">
                A confirmation email has been sent to: <span className="font-semibold text-black">{formData.email}</span>
              </p>
            </div>

             {/* Separator */}
             <hr className="border-gray-200" />

            {/* What Happens Next */}
            <div className="flex items-start gap-3">
              <CalendarClock className="h-5 w-5 text-support-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">What Happens Next?</p>
                <p className="text-sm text-gray-600 mt-1">
                  Our support team will review your request and respond based on the urgency level provided. Estimated initial response times:
                  <ul className="list-disc pl-5 mt-1 text-xs">
                      <li><b>High Urgency:</b> Within 4 business hours</li>
                      <li><b>Medium Urgency:</b> Within 1 business day</li>
                      <li><b>Low Urgency:</b> Within 2 business days</li>
                  </ul>
                   <span className="text-xs text-gray-500 italic">Actual response times may vary based on ticket volume and complexity.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="button"
              onClick={handleNewRequest}
              className="bg-support-blue hover:bg-support-dark-blue text-white px-6 py-2.5" // Slightly larger button
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationStep;