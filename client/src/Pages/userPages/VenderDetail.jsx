import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Reviews from "../../Components/Reviews";
import bfimager from "../../Assests/hero1.jpg";
import certified from "../../Assests/certified-logo.png";
import ReportModal from "../../Components/ReportModal";
import QuestiionAnswer from "../../Components/Q&A";

export default function VenderDetail() {
  const [vender, setVender] = useState();
  const [ErrorPopup, setErrorPopup] = useState(false);
  const [SuccesPopup, setSuccesPopup] = useState(false);
  const [msg, setMsg] = useState("");
  const [products, setProducts] = useState(null);
  const [review, setReview] = useState({ comment: "", rating: "" });
  const navigate = useNavigate();
  const { id } = useParams();

  const handleStarClick = (i) => setReview({ ...review, rating: i + 1 });
  const getInput = (e) => setReview({ ...review, comment: e.target.value });

  const renderStars = () =>
    [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`star w-10 h-10 ${i < review.rating ? "text-yellow-500" : "text-gray-500"} cursor-pointer`}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        onClick={() => handleStarClick(i)}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));

  const ratingStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`star w-10 h-10 ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-500"} cursor-pointer`}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));

  const getAllProducts = async () => {
    try {
      const r = await fetch(`http://localhost:8000/api/vender/products/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      setProducts(await r.json());
    } catch {}
  };

  const fetchData = async () => {
    try {
      const r = await fetch(`http://localhost:8000/api/user/vender/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const d = await r.json();
      if (r.status === 505) {
        setMsg(d.message);
        setErrorPopup(true);
        setTimeout(() => navigate("/loginUser"), 2000);
      } else if (r.status === 401) {
        setMsg(d.message);
        setErrorPopup(true);
      } else if (r.status === 200) setVender(d);
    } catch {}
  };

  const sendReview = async () => {
    const { comment, rating } = review;
    const cfg = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ comment, rating }),
    };
    const r = await fetch(`http://localhost:8000/api/user/newReview/${id}`, cfg);
    const d = await r.json();
    if (r.status === 505) {
      setErrorPopup(true);
      setMsg(d.message);
      navigate("/loginUser");
    } else if (r.status === 401) {
      setErrorPopup(true);
      setMsg(d.message);
    } else if (r.status === 200) {
      setSuccesPopup(true);
      setMsg("Your Review has been Send");
    }
  };

  useEffect(() => {
    getAllProducts();
    fetchData();
  }, [id]);

  return (
    <div>
      <Navbar isAuthenticated />
      {/* pop‑ups unchanged */}
      <section className="bg-white">
        <div className="flex  items-center justify-center px-6 my-2 max-w-xxl  mx-auto lg:py-0">
          <div className="w-full bg-white  md:py-3   xl:p-0  dark:border-gray-300">
            <div className="p-6 space-y-3 border md:space-y-3 sm:p-6">
              <div className="flex justify-between">
                <h1 className="text-xl font-bold leading-tight tracking-tight  md:text-xl theme_txt">
                  {vender?.shopName}
                </h1>
                <ReportModal vendorId={id}>
                  <span className="text-sm flex flex-col items-center leading-tight tracking-tight text-gray-900 cursor-pointer  text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="32" viewBox="0 0 448 512">
                      <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z" />
                    </svg>
                    Report Vendor
                  </span>
                </ReportModal>
              </div>
              <div>{vender?.description}</div>

              {vender && (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          TDS (ppm)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          pH Level
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">{vender.shopName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{vender.tds || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{vender.phLevel || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <h1 className="text-xl font-bold leading-tight tracking-tight  md:text-xl theme_txt">
                {vender?.qualityReport && "Our Water Quality "}
              </h1>
              {vender?.qualityReport && (
                <div className="relative p-8 rounded-lg  overflow-hidden">
                  <div className="absolute inset-0 bg-white/90" />
                  <div
                    className="absolute inset-0 opacity-20 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${certified})` }}
                  />
                  <div className="relative z-10">
                    <div
                      className="prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: vender.qualityReport }}
                    />
                  </div>
                </div>
              )}

              {/* rest of file unchanged: tanker list, location, reviews, etc. */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
