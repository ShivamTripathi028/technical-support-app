// src/components/form/ConfirmationStep.tsx

import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, CalendarClock, Mail, Loader2 } from "lucide-react"; // Added Loader2

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
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-center mb-2 text-support-blue">Support Request Submitted</h2>
            <p className="text-gray-500 text-center mb-4">
              Thank you for contacting RAK Technical Support
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            
            <div>
              <p className="text-sm text-gray-500">Your Ticket ID</p>
              <p className="font-medium text-lg"> {/* Made ID larger */}
                {actualTicketId ? `#${actualTicketId}` : <Loader2 className="h-5 w-5 animate-spin inline-block" /> /* Show loader if ID not yet available */}
              </p>
              <p className="text-xs text-gray-500 mt-1">Please refer to this ID in future communications.</p>
            </div>
            

            <div>
              <p className="text-sm text-gray-500">Support Request for</p>
              <p className="font-medium">{formData.deviceModel || "N/A"}</p>
            </div>

            <div className="flex items-center gap-3 text-support-blue">
              <Mail className="h-5 w-5" />
              <p className="font-medium">
                A confirmation email has been sent to {formData.email}
              </p>
            </div>

            {/* ... (What happens next section remains the same) ... */}
             <div className="flex items-start gap-3 mt-4">
              <CalendarClock className="h-5 w-5 text-support-blue flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">What happens next?</p>
                <p className="text-sm text-gray-600">
                  Our support team will review your request and respond within:
                  {formData.urgencyLevel === 'high'
                    ? ' 4-8 business hours'
                    : formData.urgencyLevel === 'medium'
                      ? ' 1 business day'
                      : ' 2 business days'}
                  . Response times may vary based on ticket volume.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="button"
              onClick={handleNewRequest}
              className="bg-support-blue hover:bg-support-dark-blue text-white"
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