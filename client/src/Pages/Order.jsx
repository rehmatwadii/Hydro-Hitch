import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";


import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
// Alias the icons to match the desired names
const CheckIcon = AiOutlineCheck;
const ClearIcon = AiOutlineClose;
export default function Order() {
  const initialOrderState = {
    CustomerName: "",
    CustomerEmail: "",
    CustomerPhone: "",
    CustomerAddress: "",
    Price: "",
  };
  const userData = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData')).data;
  const userId = userData._id;
  const [vender, setVender] = useState();
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [ErrorPopup, setErrorPopup] = useState(false);
  const [SuccesPopup, setSuccesPopup] = useState(false);
  const [msg, setMsg] = useState("");
  const [order, setOrder] = useState(initialOrderState);
  const { id } = useParams();
  const { state } = useLocation()
  let value, name;
  const handleClosePopup = () => {
    setSuccesPopup(false);
    setErrorPopup(false);
  };
  const getUserdata = (e) => {
    name = e.target.name;
    value = e.target.value;
    setOrder({ ...order, [name]: value });
    console.log(order);
  };

  function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
    // Convert latitude and longitude from degrees to radians
    const toRad = (degree) => degree * Math.PI / 180;

    const R = 6371; // km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) *
      Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    let distance = R * c;

    if (unit === 'mi') {
      distance = distance * 0.621371;
    }

    return Math.round(distance * 100) / 100;
  }

  const navigate = useNavigate();
  const handlePriceChange = (e) => {
    const selectedPrice = e.target.value;
    setOrder({ ...order, Price: selectedPrice });
    setSubtotal(parseFloat(selectedPrice));
    console.log(order);
    console.log(vender);
  };
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
        setTimeout(() => {
          handleClosePopup();
        }, 2000);
      } else if (response.status === 200) {
        setVender(data);
      }
    } catch (err) {
      console.log(err);
    }
  }


  const makeOrder = async (e) => {
    e.preventDefault();
    const {
      CustomerName,
      CustomerEmail,
      CustomerPhone,
      CustomerAddress,
      Price,
    } = order;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        CustomerName: CustomerName,
        CustomerEmail: CustomerEmail,
        CustomerPhone: CustomerPhone,
        CustomerAddress: CustomerAddress,
        Price: state?.price + deliveryCharges,
        productId: state?._id,
        userId: userId
      }),
    };

    let data;
    if (
      CustomerName && CustomerEmail && CustomerPhone && CustomerAddress
    ) {
      const response = await fetch(
        `http://localhost:8000/api/user/order/${id}`,
        options
      );
      data = await response.json();
      if (response.status === 201) {
        console.log(data.message);
        setSuccesPopup(true);
        setMsg(data.message);
        setOrder(initialOrderState);
        setSubtotal(0);
        setTimeout(() => {
          handleClosePopup();
        }, 4000);
      } else if (response.status === 422) {
        setMsg(data.message);
        setErrorPopup(true);
        setTimeout(() => {
          handleClosePopup();
        }, 2000);
      } else if (response.status === 420) {
        setMsg(data.message);
        setErrorPopup(true);
        setTimeout(() => {
          handleClosePopup();
        }, 2000);
      }
    } else {
      setErrorPopup(true);
      setMsg("Please Fill in all Fields ");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);
  const isAuthenticated = true;

  useEffect(() => {

    if (vender) {
      setDeliveryCharges(Math.round(calculateDistance(userData?.latitude, userData?.longitude, vender.latitude, vender.longitude) * state.dcPerKm))
    }
  }, [vender])
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar isAuthenticated={isAuthenticated} />
      {ErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                <ClearIcon fontSize="large" className="text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold">A Problem Occurred</h3>
                <p className="mt-1 text-sm">{msg}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={handleClosePopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {SuccesPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <CheckIcon fontSize="large" className="text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold">Order Successfully Booked</h3>
                <p className="mt-1 text-sm">{msg}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md"
                onClick={handleClosePopup}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-6">
        <section className="w-full max-w-7xl bg-white p-8 rounded-lg shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
                Order Details
              </h1>
              <p className="text-gray-500 mb-8">
                Welcome to the Order Details. Please fill in your details to proceed.
              </p>
              <form className="space-y-6" onSubmit={makeOrder}>
                <div className="space-y-1">
                  <label htmlFor="CustomerName" className="block text-sm font-bold text-gray-700">
                    Enter Your Name
                  </label>
                  <TextField
                    onChange={getUserdata}
                    name="CustomerName"
                    id="CustomerName"
                    type="text"
                    size="small"
                    fullWidth
                    value={order.CustomerName}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#ccc",
                        },
                        "&:hover fieldset": {
                          borderColor: "#888",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#aaa",
                        },
                        backgroundColor: "white",
                      },
                      input: {
                        color: "black",
                      },
                    }}
                    variant="outlined"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="CustomerEmail" className="block text-sm font-bold text-gray-700">
                    Enter Your Active Email
                  </label>
                  <TextField
                    onChange={getUserdata}
                    name="CustomerEmail"
                    id="CustomerEmail"
                    type="email"
                    size="small"
                    fullWidth
                    value={order.CustomerEmail}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#ccc",
                        },
                        "&:hover fieldset": {
                          borderColor: "#888",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#aaa",
                        },
                        backgroundColor: "white",
                      },
                      input: {
                        color: "black",
                      },
                    }}
                    variant="outlined"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="CustomerPhone" className="block text-sm font-bold text-gray-700">
                    Enter Your Active Phone
                  </label>
                  <TextField
                    onChange={getUserdata}
                    name="CustomerPhone"
                    id="CustomerPhone"
                    type="tel"
                    size="small"
                    fullWidth
                    value={order.CustomerPhone}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#ccc",
                        },
                        "&:hover fieldset": {
                          borderColor: "#888",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#aaa",
                        },
                        backgroundColor: "white",
                      },
                      input: {
                        color: "black",
                      },
                    }}
                    variant="outlined"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="CustomerAddress" className="block text-sm font-bold text-gray-700">
                    Please Enter Your Address For the Service
                  </label>
                  <TextField
                    onChange={getUserdata}
                    name="CustomerAddress"
                    id="CustomerAddress"
                    type="text"
                    size="small"
                    fullWidth
                    value={order.CustomerAddress}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#ccc",
                        },
                        "&:hover fieldset": {
                          borderColor: "#888",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#aaa",
                        },
                        backgroundColor: "white",
                      },
                      input: {
                        color: "black",
                      },
                    }}
                    variant="outlined"
                  />
                </div>
                {/* <div className="space-y-1">
                  <label htmlFor="Price" className="block text-sm font-bold text-gray-700">
                    Please Select The Quantity
                  </label>
                  <TextField
                    select
                    id="Price"
                    name="Price"
                    value={order.Price}
                    onChange={handlePriceChange}
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#ccc",
                        },
                        "&:hover fieldset": {
                          borderColor: "#888",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#aaa",
                        },
                        backgroundColor: "white",
                      },
                      input: {
                        color: "black",
                      },
                    }}
                    variant="outlined"
                  >
                    <MenuItem value={vender && vender.price1}>1000 Gallons</MenuItem>
                    <MenuItem value={vender && vender.price2}>2000 Gallons</MenuItem>
                    <MenuItem value={vender && vender.price3}>3000 Gallons</MenuItem>
                  </TextField>
                </div> */}
                <div className="text-sm text-gray-500">
                  By creating an account, you agree to our
                  <a href="#" className="text-gray-700 underline">
                    {" "}
                    terms and conditions{" "}
                  </a>
                  and
                  <a href="#" className="text-gray-700 underline">
                    privacy policy
                  </a>
                  .
                </div>
                {/* <button
                  type="submit"
                  className="w-full py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 rounded-lg font-semibold shadow-lg"
                >
                  Proceed to Checkout
                </button> */}
              </form>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
              <h5 className="text-2xl font-extrabold mb-6">ORDER SUMMARY</h5>
              {vender && <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Vender Name</span>
                  <span>{vender && vender.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Customer Name</span>
                  <span>{order.CustomerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sub total:</span>
                  <span>{state?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Delivery:</span>
                  <span>{deliveryCharges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span>{state?.price + deliveryCharges}</span>
                </div>
              </div>}
              <button
                onClick={makeOrder}
                className="w-full py-3 mt-8 text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 rounded-lg font-semibold shadow-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
