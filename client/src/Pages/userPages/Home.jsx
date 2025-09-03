import React from 'react';
import Navbar from '../../Components/Navbar';
import Stats from '../../Components/Stats';
import Header from '../../Components/Header';
import HeroSection from '../../Components/heroSection';
import cover from '../../Assests/cover.jpeg';
import Testimonials from '../../Components/Testonomicals';
import { useLocation } from 'react-router-dom'; // Import useLocation

export default function Home() {
  const location = useLocation();
  const isAuthenticated = location.state?.isAuthenticated || false;

  return (
    <div className="bg-gray-200">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="themeColor">
        <HeroSection />
        <div className="relative">
          <img src={cover} className="w-full h-auto object-cover bgCover" alt="Cover" />
        </div>
        <Header className="mt-3" />
        <Stats />
        <Testimonials />
      </div>
    </div>
  );
}
