import { TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function VenderListing() {
  const [vender, setVender] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const ratingStars = (rating) => {
    const roundedRating = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`star w-8 h-8 ${i < roundedRating ? "text-yellow-500" : "text-gray-500"} cursor-pointer`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  async function fetchData() {
    try {
      const response = await fetch("http://localhost:8000/api/user/allVenders");
      const result = await response.json();
      console.log(result);
      if (response.status === 200) {
        setVender(result);
      } else {
        console.log("error");
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []);

  const sendData = async () => {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          minPrice: minPrice,
          maxPrice: maxPrice,
        }),
      };

      if (minPrice && maxPrice) {
        const response = await fetch("http://localhost:8000/api/user/filter", options);
        const data = await response.json();
        console.log(data);
        setVender(data);
      } else {
        alert("Please Fill All the Fields");
      }
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Filters</h1>
          <div className="space-y-4 border-b pb-4">
            <h2 className="text-lg text-gray-600 font-bold">By Price</h2>
            <form className="space-y-4" action="#">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="mb-2">Min</p>
                  <TextField
                    onChange={(e) => setMinPrice(parseInt(e.target.value, 10) || 0)}
                    name="minPrice"
                    label="0"
                    type="number"
                    size="small"
                    className="w-full"
                  />
                </div>
                <div>
                  <p className="mb-2">Max</p>
                  <TextField
                    onChange={(e) => setMaxPrice(parseInt(e.target.value, 10) || 10000)}
                    name="maxPrice"
                    label="10000+"
                    type="number"
                    size="small"
                    className="w-full"
                  />
                </div>
              </div>
            </form>
            <button
              onClick={sendData}
              type="button"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium text-sm px-5 py-2.5 rounded-lg text-center mt-4"
            >
              Submit
            </button>
          </div>
          <div className="mt-4">
            <h2 className="text-lg text-gray-600 font-bold">By Location</h2>
            {/* Add location filter here if needed */}
          </div>
        </div>
        <div>
          {vender.map((e) => (
            <section key={e._id} className="mb-4">
              <Link to={`/vender/${e._id}`}>
                <div className="flex items-center justify-center bg-white rounded-xl shadow-lg p-6 mb-4">
                  <div className="w-full">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h1 className="text-xl font-bold leading-tight text-gray-900">
                          {e.shopName}
                        </h1>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xl font-bold leading-tight text-gray-900 bg-blue-100 px-3 py-1 rounded-full">
                          {e.price1} <span className="text-sm text-gray-500">PKR</span>
                        </span>
                        <span className="text-xl font-bold leading-tight text-gray-900 mx-1">
                          ~
                        </span>
                        <span className="text-xl font-bold leading-tight text-gray-900 bg-blue-100 px-3 py-1 rounded-full">
                          {e.price3} <span className="text-sm text-gray-500">PKR</span>
                        </span>
                      </div>
                    </div>
                    <div className="mb-2 text-gray-700">{e.description}</div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          {ratingStars(e.OverAllRating)}
                          <span className="text-gray-700 text-lg ml-3">
                            ({e.OverAllRating.toFixed()})
                          </span>
                        </div>
                        <div className="text-gray-600 text-sm mt-2">
                          ({e.reviews.length}) Reviews
                        </div>
                      </div>
                      <button className="theme_btn p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        SHOW MORE <span aria-hidden="true">&rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
