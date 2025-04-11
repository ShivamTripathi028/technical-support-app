
import React from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Hash, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DEVICE_MODELS } from "@/constants/supportForm";

const DeviceInfoStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useSupportForm();
  
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceModel || !formData.serialNumber) {
      return;
    }
    nextStep();
  };
  
  const isFormValid = 
    formData.deviceModel.trim().length > 0 && 
    formData.serialNumber.trim().length > 0;

  return (
    <form onSubmit={handleNext} className="step-container">
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Device Information</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceModel" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" /> RAK Device Model <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.deviceModel} 
                onValueChange={(value) => updateFormData({ deviceModel: value })}
              >
                <SelectTrigger className="border-support-light-blue focus:border-support-blue">
                  <SelectValue placeholder="Select Device Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DEVICE_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="flex items-center gap-2">
                <Hash className="h-4 w-4" /> Device EUI Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serialNumber"
                placeholder="e.g. ACxxxxxxxxxxxxxxxx"
                value={formData.serialNumber}
                onChange={(e) => updateFormData({ serialNumber: e.target.value })}
                className="border-support-light-blue focus:border-support-blue"
                required
              />
              <p className="text-xs text-gray-500">The EUI number can be found on the device label or in the device settings</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firmwareVersion" className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Firmware Version <span className="text-gray-400">(Optional)</span>
              </Label>
              <Input
                id="firmwareVersion"
                placeholder="e.g. v1.2.3"
                value={formData.firmwareVersion}
                onChange={(e) => updateFormData({ firmwareVersion: e.target.value })}
                className="border-support-light-blue focus:border-support-blue"
              />
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

export default DeviceInfoStep;
