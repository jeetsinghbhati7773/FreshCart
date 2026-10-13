import React, { useEffect } from "react";

const NotFound = () => {
  useEffect(() => {
    const el = document.getElementById("path-display");
    if (el) {
      el.textContent = window.location.pathname;
    }
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div className="mt-8 min-h-screen flex items-center justify-center  text-[#111] px-4">
        <div
          className="text-center border border-gray-500 max-w-lg w-full p-8 sm:p-10 bg-white rounded-3xl relative overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04),0_10px_10px_-5px_rgba(0,0,0,0.01)]"
          style={{ animation: "fadeIn 0.6s ease-out both" }}
        >
          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#3ae38c] to-[#26db8d] rounded-t-3xl" />

          {/* Icon */}
          <div
            className="mb-6"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-28 h-28 mx-auto text-[#3ae38c]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#3ae38c] to-[#26db8d] text-transparent bg-clip-text mb-2">
            404
          </h1>
          <p className="text-xl font-medium mb-2">Page Not Found</p>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Path Info */}
          <div className="text-sm font-mono bg-slate-100 text-slate-600 px-4 py-3 rounded-md mb-6 break-all inline-block">
            Path: <span id="path-display">/nonexistent</span>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/"
              className="px-6 py-2 bg-[#3ae38c] hover:bg-[#44ae7c] text-white font-medium rounded-md transition-all border-2 border-[#3ae38c] shadow hover:-translate-y-1 hover:shadow-md"
            >
              Go to Homepage
            </a>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-transparent text-[#3ae38c] border-2 border-[#3ae38c] font-medium rounded-md hover:bg-[#ecfdf5] transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
