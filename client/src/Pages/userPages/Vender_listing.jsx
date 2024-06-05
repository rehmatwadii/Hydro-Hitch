  import React, { useState } from "react";
  import Navbar from "../../Components/Navbar";
  import VenderListing from "../../Components/VenderListing";
  import { TextField } from "@mui/material";

  export default function Vender_listing() {
    return (
      <div className="bg-gray-200" >
        <Navbar />
        {/* <div className="max-w-7xl custom_break px-4 mx-6 flex justify-content-center ">
          <div className=" w-full bg-white rounded-xl shadow border md:py-6  m-4 p-2">
          <h1 className="text-2xl font-bold mb-2">Filters</h1>
            <div className="space-y-4 border-y" >
            <h1 className="text-lg text-gray-600 font-bold mt-2 ">By Price</h1>
            <form class="space-y-8 md:space-y-4 mt-3" action="#">
              <div>
                <p className="mb-2">min</p>
                <TextField
                  onChange={(e)=> setMin(e.target.value)}
                  name="email"
                  id="outlined-email-input"
                  label="0"
                  type="number"
                  size="small"
                  className=""
                />
              </div>
              <div>
                <p className="mb-2">max</p>
                <TextField
                  onChange={(e)=> setMax(e.target.value)}
                  name="password"
                  id="outlined-password-input"
                  label="10000+"
                  type="number"
                  size="small"
                  className=""
                  autoComplete="current-password"
                />
              </div>
            </form>
            <button
                onClick={sendData}
                type="submit"
                class="w-full text-white bg-gray-800 hover:bg-black focus:ring-4  font-medium text-sm px-5 py-2.5 text-center  dark:hover:bg-primary-700"
              >
              Submit
              </button>
            </div>
            <div className="">
            <h1 className="text-lg text-gray-600 font-bold mt-2 ">By Location</h1>
            </div>
          </div> */}
          <VenderListing />
        </div>
      // </div>
    );
  }
