import React, { useState, useEffect } from "react";
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
    latitude: "",
    longitude: "",
  });

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUser((prevUser) => ({
            ...prevUser,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const getUserdata = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const sendData = async (e) => {
    e.preventDefault();

    const { name, email, phone, password, latitude, longitude } = user;

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
        latitude,
        longitude,
      }),
    };

    try {
      const response = await fetch("http://localhost:8000/api/user/register", options);
      const data = await response.json();

      if (response.status === 201) {
        setUser({
          name: "",
          email: "",
          phone: "",
          password: "",
          latitude: "",
          longitude: "",
        });
        setSuccessPopup(true);
        setMsg(data.message);
        setTimeout(() => {
          navigate("/loginUser");
        }, 1000);
      } else {
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
      {/* Error and success popups here */}
      <div className="flex flex-col items-center justify-center mt-20">
        <section className="bg-opacity-70 backdrop-blur-lg rounded-xl p-8 w-full max-w-md bg-gray-800">
          <h1 className="text-3xl font-bold text-center text-white mb-6">Register As a User</h1>
          <form className="space-y-6" onSubmit={sendData}>
            <TextField
              onChange={getUserdata}
              name="name"
              label="Name"
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
              value={user.name}
            />
            <TextField
              onChange={getUserdata}
              name="email"
              label="Email"
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
              value={user.email}
            />
            <TextField
              onChange={getUserdata}
              name="phone"
              label="Phone"
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
              value={user.phone}
            />
            <TextField
              onChange={getUserdata}
              name="password"
              label="Password"
              type="password"
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
              value={user.password}
            />
            <TextField
              onChange={getUserdata}
              label="Latitude"
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
              value={user.latitude}
            />
            <TextField
              onChange={getUserdata}
              label="Longitude"
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
              value={user.longitude}
            />
            <button type="submit" className="w-full py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 rounded-lg font-semibold">
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
