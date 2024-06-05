import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Pages/userPages/Home";
import Login_User from "./Pages/userPages/Login_User";
import Register_User from "./Pages/userPages/Register_User";
import Register_Vender from "./Pages/venderPages/Register_vender";
import Login_Vender from "./Pages/venderPages/Login_vender";
import Vender_listing from "./Pages/userPages/Vender_listing";
import VenderDetail from "./Pages/userPages/VenderDetail";
import Order from "./Pages/Order";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loginUser" element={<Login_User />} />
        <Route path="/registerUser" element={<Register_User />} />
        <Route path="/loginVender" element={<Login_Vender />} />
        <Route path="/registerVender" element={<Register_Vender />} />
        <Route path="/venderListing" element={<Vender_listing />} />
        <Route path="/vender/:id" element={<VenderDetail />} />
        <Route path='/vender/:id/order' element={<Order/>}/>
      </Routes>
    </>
  );
}

export default App;
