import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import { Link, useNavigate, useParams } from "react-router-dom";
import Reviews from "../../Components/Reviews";

export default function VenderDetail() {
  const [vender, setVender] = useState();
  const [ErrorPopup, setErrorPopup] = useState(false);
  const [SuccesPopup,setSuccesPopup]=useState(false);
  const [msg, setMsg] = useState("");

  const [review, setReview] = useState({
    comment: "",
    rating: "",
  });

  const handleStarClick = (index) => {
    setReview({
      ...review,
      rating: index + 1,
    });
    console.log(review.rating);
  };

  const getInput = (e) => {
    setReview({
      ...review,
      comment: e.target.value, // Update comment property
    });
    console.log(review);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`star w-10 h-10 ${
            i < review.rating ? "text-yellow-500" : "text-gray-500"
          } cursor-pointer`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          onClick={() => handleStarClick(i)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  const handleClosePopup = () => {
    setSuccesPopup(false)
    setErrorPopup(false);
  };

  const ratingStars = (rating) => {
  const roundedRating = Math.floor(rating);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`star w-10 h-10 ${i < roundedRating ? 'text-yellow-500' : 'text-gray-500'} cursor-pointer`}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      </svg>
    );
  }
  return stars;
};
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(id);
  
  async function fetchData() {
    try {
      const response = await fetch(
        `http://localhost:8000/api/user/vender/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("===== Response =====:", response); // Log the response object
      const data = await response.json();
      console.log("Result:", data); // Log the parsed JSON result
      if (response.status === 505) {
        setMsg(data.message);
        setErrorPopup(true);
        setTimeout(() => {
          navigate("/loginUser");
        }, 2000);
      } else if (response.status === 401) {
        setMsg(data.message);
        setErrorPopup(true);
      } else if (response.status === 200) {
        setVender(data);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const sendReview = async () => {
    const { comment, rating } = review;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        comment: comment,
        rating: rating,
      }),
    };
    const Response = await fetch(
      `http://localhost:8000/api/user/newReview/${id}`,
      options
    );
    const data = await Response.json();
    if (Response.status === 505) {
      setErrorPopup(true);
      setMsg(data.message);
      navigate("/loginUser");
    } else if (Response.status === 401) {
      setErrorPopup(true);
      setMsg(data.message);
    } else if (Response.status === 200) {
        setSuccesPopup(true);
        setMsg("Your Review has been Send"); 
    }
  };
  console.log(vender); // Fetch data when the component mounts

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div>
      <Navbar />
      {ErrorPopup && (
        <div className="overlay">
          <div className="popup d-flex flex-col justify-content-center items-center space-y-3">
            <div className="flex">
              <div class=" flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  class="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-xl  mx-3 mb-3">
                  An Error Occurred
                </h1>
                <h1 className="fs-4 ww-bold mx-3">{msg}</h1>
              </div>
            </div>
            <div className=" custum-end">
              <button
                className="p-3 text-white    btn bg-red-600"
                onClick={handleClosePopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}  
      {SuccesPopup && (
      <div className="overlay">
      <div className="popup d-flex flex-col justify-content-center items-center space-y-3">
        <div className="flex">
          <div class=" flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <svg
               viewBox="0 0 24 24"
               class="text-green-600 w-16 h-16 mx-auto my-6"
             >
               <path
                 fill="currentColor"
                 d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
               ></path>
             </svg>
          </div>
          <div>
            <h1 className="font-bold text-xl  mx-3 mb-3">
             Congratulation
            </h1>
            <h1 className="fs-4 ww-bold mx-3">{msg}</h1>
          </div>
        </div>
        <div className=" custum-end">
          <button
            className="p-3 text-white    btn bg-green-500"
            onClick={handleClosePopup}
          >
            OK
          </button>
        </div>
      </div>
    </div>
      )}
      <section class="bg-white">
        <div class="flex  items-center justify-center px-6 my-2 max-w-xxl  mx-auto lg:py-0">
          <div class="w-full bg-white  md:py-3   xl:p-0  dark:border-gray-300">
            <div class="p-6 space-y-3 border md:space-y-3 sm:p-6">
              <div className="flex justify-between">
                <div>
                  <h1 class="text-xl font-bold leading-tight tracking-tight  md:text-xl theme_txt">
                    {vender && vender.shopName}
                  </h1>
                </div>
                <div>
                  {/* <span className="text-xl font-bold leading-tight tracking-tight text-gray-900  text-black">
                    FAVOURTIE
                  </span>
                  ~ */}
                  <span className="text-sm flex flex-col items-center leading-tight tracking-tight text-gray-900  text-black">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      width="32"
                      viewBox="0 0 448 512"
                    >
                      <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z" />
                    </svg>
                    Report Vender
                  </span>
                </div>
              </div>
              <div>{vender && vender.description}</div>
              <div class="flex flex-col">
                <h1>Pricing</h1>
                <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div class="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                    <div class="overflow-hidden">
                      <table class="min-w-full border">
                        <thead class="border-b bg-gray-300">
                          <tr>
                            <th
                              scope="col"
                              class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                            >
                              #
                            </th>
                            <th
                              scope="col"
                              class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                            >
                              Quantity
                            </th>
                            <th
                              scope="col"
                              class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                            >
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-b">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              1
                            </td>
                            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              1000 Gallons
                            </td>
                            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              {vender && vender.price1} pkr
                            </td>
                          </tr>
                          <tr class="bg-white border-b">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              2
                            </td>
                            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              2000 Gallons
                            </td>
                            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              {vender && vender.price2} pkr
                            </td>
                          </tr>
                          <tr class="bg-white border-b">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              3
                            </td>
                            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              3000 Gallons
                            </td>
                            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              {vender && vender.price3} pkr
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="font-semibold">
                Price For 1000 Gallons Tanker :{" "}
                <span className="font-normal">
                  {vender && vender.price1} pkr pkr{" "}
                </span>
              </div>
              <div className="font-semibold">
                Price For 2000 Gallons Tanker :{" "}
                <span className="font-normal">
                  {vender && vender.price2} pkr pkr
                </span>
              </div>
              <div className="font-semibold">
                Price For 3000 Gallons Tanker :{" "}
                <span className="font-normal">
                  {vender && vender.price3} pkr pkr{" "}
                </span>
              </div> */}
              <div className="font-bold">
                We are Located at <span aria-hidden="true">&rarr;</span>{" "}
                <span className="font-normal">
                  {vender && vender.shopAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <div class="flex items-end">
                {ratingStars(vender && vender.OverAllRating)}
                  <span class="text-yellow-500 text-6xl ml-3">
                    {vender && vender.OverAllRating.toFixed(2)}
                  </span>
                </div>
                <div>
                  <Link to={`/vender/${id}/order`} className="thme_btn">
                    ORDER NOW <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              <div class="text-gray-600 ">
                ({vender && vender.TotalReviews}) Reviews
              </div>
            </div>
            <div className="border my-3">
              {vender && <Reviews reviews={vender.reviews} />}
            </div>
            <div className="border">
              <h1 className="text-xl font-bold bg-gray-300 p-3 ">
                Submit Your Experience
              </h1>
              {/* <div class="min-h-screen bg-gray-300 py-6 flex flex-col justify-center sm:py-12"> */}
              <div class="py-3 sm:max-w-xl sm:mx-auto my-2">
                <div class="bg-white min-w-1xl flex flex-col rounded-xl shadow-lg">
                  <div class="px-12 py-5">
                    <h2 class="text-gray-800 text-3xl font-semibold">
                      Your Experience matters to us!
                    </h2>
                  </div>
                  <div class="bg-gray-200 w-full flex flex-col items-center">
                    <div class="flex flex-col items-center py-6 space-y-3">
                      <span class="text-lg text-gray-800">
                        How was quality of the Work?
                      </span>
                      <div class="flex space-x-3">{renderStars()}</div>
                    </div>
                    <div class="w-3/4 flex flex-col">
                      <textarea
                        rows="3"
                        class="p-4 text-gray-500 rounded-xl resize-none"
                        placeholder="Leave a Text if you want"
                        onChange={getInput}
                      ></textarea>
                      <button
                        class="py-3 my-8 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white"
                        onClick={sendReview}
                      >
                        Rate now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* </div> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
