
import React, { useCallback, useState } from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Sparkles, Info, Upload, File as FileIcon, Image, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PROBLEM_TYPES, URGENCY_LEVELS } from "@/constants/supportForm";
import { ProblemType, UrgencyLevel } from "@/types/supportForm";

const IssueDescriptionStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useSupportForm();
  const [isDragging, setIsDragging] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issueDescription || !formData.urgencyLevel) {
      return;
    }
    nextStep();
  };

  const isFormValid = formData.issueDescription.trim().length > 0 && formData.urgencyLevel;
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);
  
  const handleErrorScreenshotsDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fileList = formData.errorScreenshots || [];
      const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      
      const updatedFiles = [...fileList, ...newFiles];
      updateFormData({ errorScreenshots: updatedFiles });
    }
  }, [formData.errorScreenshots, updateFormData]);
  
  const handleAttachmentsDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fileList = formData.attachments || [];
      const newFiles = Array.from(files);
      
      const updatedFiles = [...fileList, ...newFiles];
      updateFormData({ attachments: updatedFiles });
    }
  }, [formData.attachments, updateFormData]);
  
  const handleErrorScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = formData.errorScreenshots || [];
      const newFiles = Array.from(files);
      
      const updatedFiles = [...fileList, ...newFiles];
      updateFormData({ errorScreenshots: updatedFiles });
    }
  };
  
  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = formData.attachments || [];
      const newFiles = Array.from(files);
      
      const updatedFiles = [...fileList, ...newFiles];
      updateFormData({ attachments: updatedFiles });
    }
  };
  
  const removeErrorScreenshot = (index: number) => {
    if (formData.errorScreenshots) {
      const updatedFiles = [...formData.errorScreenshots];
      updatedFiles.splice(index, 1);
      updateFormData({ errorScreenshots: updatedFiles });
    }
  };
  
  const removeAttachment = (index: number) => {
    if (formData.attachments) {
      const updatedFiles = [...formData.attachments];
      updatedFiles.splice(index, 1);
      updateFormData({ attachments: updatedFiles });
    }
  };
  
  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileIcon className="w-5 h-5 text-gray-500" />;
  };

  return (
    <form onSubmit={handleNext} className="step-container">
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Issue Description</h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" /> Problem Type <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.problemType}
                onValueChange={(value) => updateFormData({ problemType: value as ProblemType })}
                className="grid grid-cols-1 md:grid-cols-2 gap-2"
              >
                {Object.entries(PROBLEM_TYPES).map(([value, label]) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`problem-${value}`} />
                    <Label htmlFor={`problem-${value}`} className="cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issueDescription" className="flex items-center gap-2">
                <Info className="h-4 w-4" /> Detailed Issue Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="issueDescription"
                placeholder="Please describe the issue in detail..."
                value={formData.issueDescription}
                onChange={(e) => updateFormData({ issueDescription: e.target.value })}
                className="min-h-[100px] border-support-light-blue focus:border-support-blue"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="errorMessage" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Error Message <span className="text-gray-400">(Optional)</span>
              </Label>
              <Textarea
                id="errorMessage"
                placeholder="Enter any error messages you're seeing..."
                value={formData.errorMessage}
                onChange={(e) => updateFormData({ errorMessage: e.target.value })}
                className="min-h-[80px] border-support-light-blue focus:border-support-blue"
              />
            </div>
            
            {/* Error Screenshot Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Image className="h-4 w-4" /> Upload Screenshot of Error <span className="text-gray-400">(Optional)</span>
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragging ? "border-support-blue bg-support-light-blue/20" : "border-gray-300 hover:border-support-light-blue"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleErrorScreenshotsDrop}
                onClick={() => document.getElementById("error-screenshot-upload")?.click()}
              >
                <div className="flex flex-col items-center gap-1">
                  <Upload className="w-8 h-8 text-support-blue mb-1" />
                  <p className="text-sm font-medium">
                    Drag and drop screenshots, or click to select
                  </p>
                </div>
                <input
                  id="error-screenshot-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleErrorScreenshotsChange}
                  className="hidden"
                />
              </div>
              
              {formData.errorScreenshots && formData.errorScreenshots.length > 0 && (
                <div className="mt-2 border rounded-md p-2">
                  <p className="text-sm font-medium mb-2">Uploaded Screenshots:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {formData.errorScreenshots.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-blue-500" />
                          <span className="text-sm truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeErrorScreenshot(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stepsToReproduce" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Steps to Reproduce <span className="text-gray-400">(Optional)</span>
              </Label>
              <Textarea
                id="stepsToReproduce"
                placeholder="Steps to reproduce the issue..."
                value={formData.stepsToReproduce}
                onChange={(e) => updateFormData({ stepsToReproduce: e.target.value })}
                className="min-h-[80px] border-support-light-blue focus:border-support-blue"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urgencyLevel" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Urgency Level <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.urgencyLevel} 
                onValueChange={(value) => updateFormData({ urgencyLevel: value as UrgencyLevel })}
              >
                <SelectTrigger className="border-support-light-blue focus:border-support-blue">
                  <SelectValue placeholder="Select Urgency Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(URGENCY_LEVELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* General Attachments Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileIcon className="h-4 w-4" /> Attach Logs or Additional Files <span className="text-gray-400">(Optional)</span>
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragging ? "border-support-blue bg-support-light-blue/20" : "border-gray-300 hover:border-support-light-blue"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleAttachmentsDrop}
                onClick={() => document.getElementById("attachment-upload")?.click()}
              >
                <div className="flex flex-col items-center gap-1">
                  <Upload className="w-8 h-8 text-support-blue mb-1" />
                  <p className="text-sm font-medium">
                    Drag and drop files, or click to select
                  </p>
                </div>
                <input
                  id="attachment-upload"
                  type="file"
                  multiple
                  onChange={handleAttachmentsChange}
                  className="hidden"
                />
              </div>
              
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mt-2 border rounded-md p-2">
                  <p className="text-sm font-medium mb-2">Uploaded Files:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file)}
                          <span className="text-sm truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

export default IssueDescriptionStep;
