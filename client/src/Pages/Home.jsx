import React from 'react'
import Navbar from '../Components/Navbar'
import Stats from '../Components/Stats'
import Header from '../Components/Header'
import heroSection from '../Components/heroSection'
export default function Home() {
  return (
    <div>
      <Navbar/>
      <div className='themeColor'>
      <heroSection/>
      <Header/>
      <Stats/>  
      </div>
    </div>
  )
}
