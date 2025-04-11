
import React from "react";
import { CircleHelp } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-6 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center sm:justify-start">
          <CircleHelp className="h-8 w-8 text-support-blue mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">RAK Technical Support</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
