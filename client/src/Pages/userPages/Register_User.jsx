import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";

export default function Register_User() {
  const [errorPopup, setErrorPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleClosePopup = () => {
    setSuccessPopup(false);
    setErrorPopup(false);
  };

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const getUserdata = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const sendData = async (e) => {
    e.preventDefault();

    const { name, email, phone, password } = user;

    // Validation checks
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorPopup(true);
      setMsg("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorPopup(true);
      setMsg("Please enter a valid email address.");
      return;
    }

    // Phone number validation
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      setErrorPopup(true);
      setMsg("Please enter a valid 11-digit phone number.");
      return;
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
      }),
    };

    let data;
    try {
      const response = await fetch("http://localhost:8000/api/user/register", options);
      data = await response.json();

      if (response.status === 201) {
        setUser({
          name: "",
          email: "",
          phone: "",
          password: "",
        });
        setSuccessPopup(true);
        setMsg(data.message);
        setTimeout(() => {
          navigate("/loginUser");
        }, 1000);
      } else if (response.status === 422 || response.status === 420) {
        setMsg(data.message);
        setErrorPopup(true);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setMsg("An error occurred. Please try again later.");
      setErrorPopup(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 bg-cover bg-no-repeat" style={{ backgroundImage: "url('https://images.alphacoders.com/739/73931.jpg')" }}>
      <Navbar />

      {errorPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold">An Error Occurred</h3>
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

      {successPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <svg
                  className="text-green-600 w-16 h-16"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold">Congratulations</h3>
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

      <div className="flex flex-col items-center justify-center mt-20">
        <section className="bg-opacity-70 backdrop-blur-lg rounded-xl p-8 w-full max-w-md bg-gray-800">
          <h1 className="text-3xl font-bold text-center text-white mb-6">Register As a User</h1>
          <form className="space-y-6" onSubmit={sendData}>
            <div className="space-y-1">
              <label htmlFor="outlined-name-input" className="block text-sm font-bold text-white">Name</label>
              <TextField
                onChange={getUserdata}
                name="name"
                id="outlined-name-input"
                type="text"
                size="small"
                fullWidth
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
              <label htmlFor="outlined-email-input" className="block text-sm font-bold text-white">E-Mail</label>
              <TextField
                onChange={getUserdata}
                name="email"
                id="outlined-email-input"
                type="email"
                size="small"
                fullWidth
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
              <label htmlFor="outlined-phone-input" className="block text-sm font-bold text-white">Phone</label>
              <TextField
                onChange={getUserdata}
                name="phone"
                id="outlined-phone-input"
                type="tel"
                size="small"
                fullWidth
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
              <label htmlFor="outlined-password-input" className="block text-sm font-bold text-white">Password</label>
              <TextField
                onChange={getUserdata}
                name="password"
                id="outlined-password-input"
                type="password"
                size="small"
                fullWidth
                autoComplete="current-password"
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
            <div className="flex items-start">
              <Link
                to="/loginUser"
                className="text-sm font-medium text-white hover:underline dark:text-primary-500 mr-3"
              >
                Already have an Account? Login ..
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 rounded-lg font-semibold"
            >
              Register
            </button>
            <Link
              to="/registerVender"
              className="block w-full py-3 mt-2 text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Or Register As a Vendor
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
