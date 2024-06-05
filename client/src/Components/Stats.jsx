import React from 'react';
import CountUp from 'react-countup';

export default function Stats() {
  return (
    <div className="bg-white py-16 relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:text-center">
          <h2 className="text-5xl text-blue-600 font-extrabold tracking-wide uppercase mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              Our Achievements
            </span>
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-10">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 animate-bounce">
              <svg
                className="w-10 h-10 text-blue-600"
                stroke="currentColor"
                viewBox="0 0 52 52"
              >
                <polygon
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  points="29 13 14 29 25 29 23 39 38 23 27 23"
                />
              </svg>
            </div>
            <h6 className="text-5xl font-bold text-gray-900">
              <CountUp start={0} end={819} duration={3} />
            </h6>
            <p className="mt-2 text-xl leading-6 font-medium text-gray-500">Orders Completed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 animate-bounce">
              <svg
                className="w-10 h-10 text-blue-600"
                stroke="currentColor"
                viewBox="0 0 52 52"
              >
                <polygon
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  points="29 13 14 29 25 29 23 39 38 23 27 23"
                />
              </svg>
            </div>
            <h6 className="text-5xl font-bold text-gray-900">
              <CountUp start={0} end={1300} duration={3} />
            </h6>
            <p className="mt-2 text-xl leading-6 font-medium text-gray-500">Registered Users</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 animate-bounce">
              <svg
                className="w-10 h-10 text-blue-600"
                stroke="currentColor"
                viewBox="0 0 52 52"
              >
                <polygon
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  points="29 13 14 29 25 29 23 39 38 23 27 23"
                />
              </svg>
            </div>
            <h6 className="text-5xl font-bold text-gray-900">
              <CountUp start={0} end={91} duration={3} />
            </h6>
            <p className="mt-2 text-xl leading-6 font-medium text-gray-500">Registered Vendors</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 animate-bounce">
              <svg
                className="w-10 h-10 text-blue-600"
                stroke="currentColor"
                viewBox="0 0 52 52"
              >
                <polygon
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  points="29 13 14 29 25 29 23 39 38 23 27 23"
                />
              </svg>
            </div>
            <h6 className="text-5xl font-bold text-gray-900">
              <CountUp start={0} end={49} duration={3} />
            </h6>
            <p className="mt-2 text-xl leading-6 font-medium text-gray-500">Products</p>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent to-blue-100 z-0 animate-pulse"></div>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-500 to-transparent opacity-50 z-0 animate-pulse"></div>
    </div>
  );
}
