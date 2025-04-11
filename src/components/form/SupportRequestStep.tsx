
import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MonitorSmartphone, Timer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SUPPORT_METHODS, URGENCY_LEVELS } from "@/constants/supportForm";
import { SupportMethod, UrgencyLevel } from "@/types/supportForm";

const SupportRequestStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useSupportForm();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const isFormValid = formData.privacyAgreed;

  // Icons for support methods
  const methodIcons = {
    email: <Mail className="h-5 w-5" />,
    phone: <Phone className="h-5 w-5" />,
    remote: <MonitorSmartphone className="h-5 w-5" />,
  };

  return (
    <form onSubmit={handleNext} className="step-container">
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Support Request</h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4" /> Preferred Support Method <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.supportMethod}
                onValueChange={(value) => updateFormData({ supportMethod: value as SupportMethod })}
                className="flex flex-col space-y-2"
              >
                {Object.entries(SUPPORT_METHODS).map(([value, label]) => (
                  <div key={value} className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value={value} id={`support-${value}`} />
                    <Label htmlFor={`support-${value}`} className="flex items-center gap-2 cursor-pointer font-medium">
                      {methodIcons[value as SupportMethod]} {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="urgencyLevel" className="flex items-center gap-2 font-medium">
                <Timer className="h-4 w-4" /> Urgency Level <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.urgencyLevel} 
                onValueChange={(value) => updateFormData({ urgencyLevel: value as UrgencyLevel })}
              >
                <SelectTrigger className="border-support-light-blue focus:border-support-blue">
                  <SelectValue placeholder="Select Urgency Level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(URGENCY_LEVELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="privacyAgreed" 
                  checked={formData.privacyAgreed}
                  onCheckedChange={(checked) => 
                    updateFormData({ privacyAgreed: checked as boolean })
                  }
                />
                <div>
                  <Label 
                    htmlFor="privacyAgreed" 
                    className="font-medium cursor-pointer"
                  >
                    Privacy Policy Agreement <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-500">
                    I agree that my information will be processed according to the privacy policy for the purpose of providing technical support.
                  </p>
                </div>
              </div>
            </div>
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
              disabled={!isFormValid}
              className="bg-support-blue hover:bg-support-dark-blue text-white"
            >
              Next Step
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default SupportRequestStep;
