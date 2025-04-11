
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
    if (!formData.name || !formData.email) {
      return;
    }
    nextStep();
  };

  // Basic email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isFormValid = formData.name.trim().length > 0 && isEmailValid;

  return (
    <form onSubmit={handleNext} className="step-container">
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Client Information</h2>
          
          <div className="space-y-4">
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
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Company Name <span className="text-gray-400">(Optional)</span>
              </Label>
              <Input
                id="company"
                placeholder="Company Name"
                value={formData.company || ''}
                onChange={(e) => updateFormData({ company: e.target.value })}
                className="border-support-light-blue focus:border-support-blue"
              />
            </div>
            
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
                className="border-support-light-blue focus:border-support-blue"
                required
              />
              {formData.email && !isEmailValid && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number <span className="text-gray-400">(Optional)</span>
              </Label>
              <Input
                id="phone"
                placeholder="+1 (123) 456-7890"
                value={formData.phone || ''}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className="border-support-light-blue focus:border-support-blue"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
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

export default ClientInfoStep;
