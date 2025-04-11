
import React from "react";
import { SupportFormProvider } from "@/context/SupportFormContext";
import SupportForm from "@/components/form/SupportForm";
import Header from "@/components/layout/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Technical Support Form</h2>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Need assistance with your RAK device? Fill out this form and our support team will help you resolve your issue.
            </p>
          </div>
          
          <SupportFormProvider>
            <SupportForm />
          </SupportFormProvider>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} RAK Technical Support. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
