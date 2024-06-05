import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import Alert from "@mui/material/Alert";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function Register_Vender() {
  const [successAlert, setSuccessAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [msg, setMsg] = useState("");

  const hideAlerts = () => {
    setSuccessAlert(false);
    setErrorAlert(false);
  };

  const [vender, setVender] = useState({
    shopName: "",
    description: "",
    shopAddress: "",
    price1: "",
    price2: "",
    price3: "",
    email: "",
    phone: "",
    password: "",
  });

  const getUserdata = (e) => {
    const { name, value } = e.target;
    setVender({ ...vender, [name]: value });
  };

  const sendData = async (e) => {
    e.preventDefault();
    const { shopName, description, shopAddress, price1, price2, price3, email, phone, password } = vender;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shopName, description, shopAddress, price1, price2, price3, email, phone, password }),
    };

    if (shopName && description && shopAddress && price1 && price2 && price3 && email && phone && password) {
      const response = await fetch("http://localhost:8000/api/vender/register", options);
      const data = await response.json();

      if (response.status === 201) {
        setVender({
          shopName: "",
          description: "",
          shopAddress: "",
          price1: "",
          price2: "",
          price3: "",
          email: "",
          phone: "",
          password: "",
        });
        setSuccessAlert(true);
        setMsg(data.message);
        setTimeout(hideAlerts, 5000);
      } else if (response.status === 422) {
        setMsg(data.message);
        setErrorAlert(true);
        setTimeout(hideAlerts, 5000);
      } else {
        setMsg("Please Try Again Later");
        setErrorAlert(true);
        setTimeout(hideAlerts, 5000);
      }
    } else {
      setErrorAlert(true);
      setMsg("Please Fill in all Fields");
      setTimeout(hideAlerts, 5000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 bg-cover bg-no-repeat" style={{ backgroundImage: "url('https://images.alphacoders.com/739/73931.jpg')" }}>
      <Navbar />
      {successAlert && (
        <Alert iconMapping={{ success: <CheckCircleOutlineIcon fontSize="inherit" /> }} className="fixed top-4 left-1/2 transform -translate-x-1/2 w-3/4 z-50">
          {msg}
        </Alert>
      )}
      {errorAlert && (
        <Alert variant="filled" severity="error" className="fixed top-4 left-1/2 transform -translate-x-1/2 w-3/4 z-50">
          {msg}
        </Alert>
      )}
      <div className="flex flex-col items-center justify-center mt-20">
        <section className="bg-opacity-70 backdrop-blur-lg rounded-xl p-8 w-full max-w-md bg-gray-800">
          <h1 className="text-3xl font-bold text-center text-white mb-6">Register As a Vendor</h1>
          <form className="space-y-6" onSubmit={sendData}>
            <div className="space-y-1">
              <TextField
                onChange={getUserdata}
                name="shopName"
                id="outlined-shopName-input"
                label="Shop Name"
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
              <TextField
                onChange={getUserdata}
                name="description"
                id="outlined-description-input"
                label="About Your Shop"
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
              <TextField
                onChange={getUserdata}
                name="shopAddress"
                id="outlined-shopAddress-input"
                label="Your Shop Address"
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
              <TextField
                onChange={getUserdata}
                name="email"
                id="outlined-email-input"
                label="E-Mail"
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
              <TextField
                onChange={getUserdata}
                name="price1"
                id="outlined-price1-input"
                label="Price for 1000 Gallons Tanker"
                type="number"
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
              <TextField
                onChange={getUserdata}
                name="price2"
                id="outlined-price2-input"
                label="Price for 2000 Gallons Tanker"
                type="number"
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
              <TextField
                onChange={getUserdata}
                name="price3"
                id="outlined-price3-input"
                label="Price for 3000 Gallons Tanker"
                type="number"
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
              <TextField
                onChange={getUserdata}
                name="phone"
                id="outlined-phone-input"
                label="Phone"
                type="number"
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
              <TextField
                onChange={getUserdata}
                name="password"
                id="outlined-password-input"
                label="Password"
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
            <button
              type="submit"
              className="w-full py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 rounded-lg font-semibold"
            >
              Register
            </button>
            <Link
              to="/loginUser"
              className="block w-full py-3 mt-2 text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Already have an Account? Login
            </Link>
            <Link
              to="/registerUser"
              className="block w-full py-3 mt-2 text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Or Register As a User
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
