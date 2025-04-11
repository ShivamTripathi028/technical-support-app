// src/components/form/ClientInfoStep.tsx

import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AtSign, User, Phone, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ClientInfoStep = () => {
  const { formData, updateFormData, nextStep } = useSupportForm();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation remains the same (name and email required)
    if (!formData.name || !formData.email) {
      // Optionally show a specific error message here
      return;
    }
    // Basic email format check before proceeding
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        // Optionally show a specific error message here
        return; // Prevent proceeding with invalid email
    }
    nextStep();
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  // Form is valid if name exists and email has a valid format
  const isFormValid = formData.name.trim().length > 0 && isEmailValid;

  return (
    <form onSubmit={handleNext} className="step-container">
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Client Information</h2>

          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="border-support-light-blue focus:border-support-blue"
                required // HTML5 validation attribute
                aria-required="true"
              />
            </div>

            {/* Company Field */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Company Name {/* Removed (Optional) */}
              </Label>
              <Input
                id="company"
                placeholder="Your Company"
                value={formData.company || ''}
                onChange={(e) => updateFormData({ company: e.target.value })}
                className="border-support-light-blue focus:border-support-blue"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <AtSign className="h-4 w-4" /> Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                // Add red border if email is entered but invalid
                className={`border-support-light-blue focus:border-support-blue ${formData.email && !isEmailValid ? 'border-red-500 focus:border-red-500 ring-red-500 focus:ring-red-500' : ''}`}
                required // HTML5 validation attribute
                aria-required="true"
                aria-invalid={formData.email ? !isEmailValid : undefined} // Accessibility attribute
              />
              {/* Show validation message only if email is entered and invalid */}
              {formData.email && !isEmailValid && (
                <p className="text-red-600 text-xs mt-1">Please enter a valid email address.</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number {/* Removed (Optional) */}
              </Label>
              <Input
                id="phone"
                type="tel" // Use type="tel" for phone numbers
                placeholder="+1 (123) 456-7890"
                value={formData.phone || ''}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className="border-support-light-blue focus:border-support-blue"
              />
            </div>
          </div>

          {/* Navigation Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!isFormValid} // Use state for disabling
              className="bg-support-blue hover:bg-support-dark-blue text-white disabled:bg-gray-400" // Added disabled style
              aria-disabled={!isFormValid}
            >
              Next Step
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ClientInfoStep;