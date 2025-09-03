import React from "react";

export default function Reviews({ reviews }) {
  const maxRating = 5;
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Reviews and Ratings</h1>
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review._id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <div className="flex items-start">
              <div className="relative flex-shrink-0">
                <img
                  className="h-16 w-16 rounded-full object-cover border-2 border-blue-600"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGhmTe4FGFtGAgbIwVBxoD3FmED3E5EE99UGPItI0xnQ&s"
                  alt="Avatar"
                />
                <div className="absolute inset-0 rounded-full shadow-inner"></div>
              </div>
              <div className="ml-4 flex-grow">
                <p className="text-sm font-bold text-gray-900">{review.name}</p>
                <p className="mt-2 text-base text-gray-800">{review.comment}</p>
                <div className="flex items-center mt-3">
                  {[...Array(review.rating)].map((_, index) => (
                    <svg
                      key={index}
                      className="h-6 w-6 text-yellow-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  {[...Array(maxRating - review.rating)].map((_, index) => (
                    <svg
                      key={index}
                      className="h-6 w-6 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(review.timestamps).toLocaleDateString()}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
