import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero';
import Footer from './components/Footer';
import ChatRoom from './components/ChatRoom';
const LandingPage=()=>(
  <>
  <Navbar/>
  <Hero/>
  <Footer/>
  </>
);
const App = () => {
  return (
   <Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/chatroom" element={<ChatRoom/>}/>
   </Routes>
  )
}

export default App
