import React from 'react';
import BusinessAccountList from '.components/BusinessAccountList'; // ✅ use this updated one
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div>
      <Header />
      <HeroSection />
      <BusinessAccountList /> {/* This is where your updated list goes */}
      <FAQSection />
      <Footer />
    </div>
  );
}
