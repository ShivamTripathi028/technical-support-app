
import React, { useCallback, useState } from "react";
import { useSupportForm } from "@/context/SupportFormContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, File as FileIcon, Image } from "lucide-react";

const FileUploadStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useSupportForm();
  const [isDragging, setIsDragging] = useState(false);
  
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
  
  const handleDrop = useCallback((e: React.DragEvent) => {
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = formData.attachments || [];
      const newFiles = Array.from(files);
      
      const updatedFiles = [...fileList, ...newFiles];
      updateFormData({ attachments: updatedFiles });
    }
  };
  
  const removeFile = (index: number) => {
    if (formData.attachments) {
      const updatedFiles = [...formData.attachments];
      updatedFiles.splice(index, 1);
      updateFormData({ attachments: updatedFiles });
    }
  };
  
  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    return <FileIcon className="w-6 h-6 text-gray-500" />;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleNext} className="step-container">
      <Card className="border-support-light-blue shadow-md">
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-support-blue">Upload Files</h2>
          
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging ? "border-support-blue bg-support-light-blue/20" : "border-gray-300 hover:border-support-light-blue"
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-support-blue mb-2" />
                <p className="text-sm font-medium">
                  Drag and drop files here, or click to select files
                </p>
                <p className="text-xs text-gray-500">
                  Upload screenshots, logs, or any files that help explain your issue
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="space-y-2">
                <Label className="font-medium">Attached Files</Label>
                <ul className="border rounded-md divide-y">
                  {formData.attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file)}
                        <span className="text-sm truncate max-w-[200px] md:max-w-[300px]">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            >
              Next Step
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default FileUploadStep;
