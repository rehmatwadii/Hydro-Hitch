import React from 'react';
import Navbar from '../../Components/Navbar';
import Stats from '../../Components/Stats';
import Header from '../../Components/Header';
import HeroSection from '../../Components/heroSection'; // Ensure this matches the actual file name
import cover from '../../Assests/cover.jpeg';
import Testimonials from '../../Components/Testonomicals'; // Ensure this file exists and is correctly named

export default function Home() {
  return (
    <div className="bg-gray-200">
      <Navbar />
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
