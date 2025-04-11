// src/components/form/IssueDescriptionStep.tsx

import React, { useCallback, useState } from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Sparkles, Info, Upload, File as FileIcon, Image, X, HelpCircle, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PROBLEM_TYPES, URGENCY_LEVELS } from "@/constants/supportForm";
import { ProblemType, UrgencyLevel } from "@/types/supportForm";
import { toast } from "@/hooks/use-toast";

const IssueDescriptionStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useSupportForm();
  const [isDragging, setIsDragging] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issueDescription || !formData.urgencyLevel) {
       toast({ title: "Missing Information", description: "Please provide an issue description and select an urgency level.", variant: "destructive"});
      return;
    }
    nextStep();
  };

  const isFormValid = formData.issueDescription.trim().length > 0 && !!formData.urgencyLevel;

  // --- Drag and Drop Handlers ---
  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); }, [isDragging]);

  // --- Combined File Handling Logic ---
  const handleFileDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFiles(e.dataTransfer.files); }, [formData.attachments, updateFormData]); // Pass dependencies to useCallback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { handleFiles(e.target.files); e.target.value = ''; };

  // Function to handle file validation and state update
  const handleFiles = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
        const currentFiles = formData.attachments || [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf', 'application/zip', '']; // Allow empty type for some uploads
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.txt', '.log', '.pdf', '.zip']; // Fallback check
        const maxSize = 5 * 1024 * 1024; // 5MB
        let currentCount = currentFiles.length;
        const maxFiles = 5;

        let filesAddedCount = 0; // Track how many files are actually added in this batch

        const newFiles = Array.from(files).filter(file => {
            if (currentCount >= maxFiles) {
                if (filesAddedCount === 0 && currentCount === maxFiles) { // Only show limit toast once per invalid batch attempt
                   toast({ title: "File Limit Reached", description: `Maximum ${maxFiles} files allowed.`, variant: "destructive"});
                }
                currentCount++; // Increment even if skipped
                return false; // Skip if limit already reached
            }

            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            const isTypeAllowed = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);

            if (!isTypeAllowed) {
                toast({ title: "Invalid File Type", description: `${file.name} is not an allowed file type.`, variant: "destructive"});
                return false;
            }
            if (file.size > maxSize) {
                toast({ title: "File Too Large", description: `${file.name} exceeds the 5MB size limit.`, variant: "destructive"});
                return false;
            }
            currentCount++; // Increment count for valid files being considered
            filesAddedCount++; // Increment count for files actually added
            return true; // File is valid
        });

        if(newFiles.length > 0) {
            updateFormData({ attachments: [...currentFiles, ...newFiles] });
        }
    }
  }, [formData.attachments, updateFormData]); // Add dependencies to useCallback

  // Function to remove an attachment
  const removeAttachment = useCallback((index: number) => {
    if (formData.attachments) {
      const updatedFiles = [...formData.attachments];
      updatedFiles.splice(index, 1);
      updateFormData({ attachments: updatedFiles });
    }
  }, [formData.attachments, updateFormData]); // Add dependencies

  // Function to get file icon
  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    if (type === 'application/pdf' || name.endsWith('.pdf')) return <FileIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
    if (type === 'text/plain' || name.endsWith('.txt') || name.endsWith('.log')) return <FileIcon className="w-5 h-5 text-gray-700 flex-shrink-0" />;
    if (type === 'application/zip' || name.endsWith('.zip')) return <FileIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
    return <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />; // Default
  };
  // --- End Combined File Handling Logic ---

  return (
    <form onSubmit={handleNext} className="step-container">
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Issue Details</h2>
          <div className="space-y-6">
            {/* Problem Type */}
            <div className="space-y-3">
               <Label className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Problem Type <span className="text-red-500">*</span></Label>
               <RadioGroup value={formData.problemType} onValueChange={(value) => updateFormData({ problemType: value as ProblemType })} className="grid grid-cols-1 sm:grid-cols-2 gap-2" required aria-required="true">
                {Object.entries(PROBLEM_TYPES).map(([value, label]) => ( <div key={value} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-support-blue"> <RadioGroupItem value={value} id={`problem-${value}`} /> <Label htmlFor={`problem-${value}`} className="cursor-pointer flex-1">{label}</Label> </div> ))}
               </RadioGroup>
            </div>
            {/* Issue Description */}
            <div className="space-y-2">
              <Label htmlFor="issueDescription" className="flex items-center gap-2"><Info className="h-4 w-4" /> Detailed Issue Description <span className="text-red-500">*</span></Label>
              <Textarea id="issueDescription" placeholder="Please describe the issue in detail..." value={formData.issueDescription} onChange={(e) => updateFormData({ issueDescription: e.target.value })} className="min-h-[120px] border-support-light-blue focus:border-support-blue" required aria-required="true" />
            </div>
            {/* Previous Ticket Reference */}
            <div className="space-y-2">
              <Label htmlFor="previousTicketId" className="flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Related Issue Reference</Label>
              <p className="text-xs text-gray-500 -mt-1 mb-1 pl-6">Enter the Ticket ID if this relates to a past support request.</p>
              <Input id="previousTicketId" placeholder="e.g., #12345" value={formData.previousTicketId || ''} onChange={(e) => updateFormData({ previousTicketId: e.target.value })} className="border-support-light-blue focus:border-support-blue" />
            </div>
             {/* Error Message */}
            <div className="space-y-2">
              <Label htmlFor="errorMessage" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Error Message</Label>
              <Textarea id="errorMessage" placeholder="Copy and paste any relevant error messages..." value={formData.errorMessage || ''} onChange={(e) => updateFormData({ errorMessage: e.target.value })} className="min-h-[80px] border-support-light-blue focus:border-support-blue" />
            </div>
            {/* Steps to Reproduce */}
            <div className="space-y-2">
              <Label htmlFor="stepsToReproduce" className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Steps to Reproduce</Label>
              <Textarea id="stepsToReproduce" placeholder="List the steps clearly..." value={formData.stepsToReproduce || ''} onChange={(e) => updateFormData({ stepsToReproduce: e.target.value })} className="min-h-[80px] border-support-light-blue focus:border-support-blue" />
            </div>
            {/* Urgency Level */}
            <div className="space-y-2">
              <Label htmlFor="urgencyLevel" className="flex items-center gap-2"><Timer className="h-4 w-4" /> Urgency Level <span className="text-red-500">*</span></Label>
              <Select value={formData.urgencyLevel} onValueChange={(value) => updateFormData({ urgencyLevel: value as UrgencyLevel })} required aria-required="true">
                <SelectTrigger id="urgencyLevel" className="border-support-light-blue focus:border-support-blue"><SelectValue placeholder="Select Urgency Level" /></SelectTrigger>
                <SelectContent><SelectGroup>{Object.entries(URGENCY_LEVELS).map(([value, label]) => ( <SelectItem key={value} value={value}>{label}</SelectItem> ))}</SelectGroup></SelectContent>
              </Select>
            </div>
            {/* Combined File Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload Files Related to This Issue</Label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors file-upload-area ${isDragging ? "border-support-blue bg-blue-50" : "border-gray-300 hover:border-support-light-blue hover:bg-gray-50"}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleFileDrop} onClick={() => document.getElementById("attachment-upload")?.click()} role="button" tabIndex={0} aria-label="Upload files area">
                <div className="flex flex-col items-center gap-1 text-gray-600"><Upload className="w-10 h-10 text-gray-400 mb-2" /> <p className="text-sm font-medium">Drag & drop files, or <span className="text-support-blue font-semibold">click to browse</span></p> <p className="text-xs text-gray-500 mt-1">Max 5 files. Max 5MB each. (Images, Logs, PDFs, ZIP accepted)</p></div>
                <input id="attachment-upload" type="file" multiple accept="image/jpeg, image/png, image/gif, text/plain, application/pdf, application/zip, .log, .txt" onChange={handleFileChange} className="hidden" />
              </div>
              {/* Display uploaded files */}
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mt-3 border rounded-md p-3 space-y-2">
                  <p className="text-sm font-medium mb-1">Uploaded Files ({formData.attachments.length}/5):</p>
                  <ul className="space-y-1">{formData.attachments.map((file, index) => ( <li key={`${file.name}-${index}-${file.lastModified}`} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-sm hover:bg-gray-100"> <div className="flex items-center gap-2 overflow-hidden min-w-0">{getFileIcon(file)}<span className="truncate flex-1" title={file.name}>{file.name}</span><span className="text-xs text-gray-500 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span></div> <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)} className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 flex-shrink-0 ml-2" aria-label={`Remove ${file.name}`}><X className="h-4 w-4" /></Button> </li> ))}</ul>
                </div>
              )}
            </div>
          </div>
          {/* Navigation */}
          <div className="flex justify-between pt-4">
             <Button type="button" onClick={prevStep} variant="outline" className="border-support-light-blue">Previous</Button>
             <Button type="submit" disabled={!isFormValid} className="bg-support-blue hover:bg-support-dark-blue text-white disabled:bg-gray-400">Review Request</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default IssueDescriptionStep;