import React from "react";

export const InitializingScreen = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        <p className="text-gray-600">Initializing...</p>
      </div>
    </div>
  );
};
