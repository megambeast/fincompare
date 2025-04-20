import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SavingsAccountList from './components/SavingsAccountList';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

const SavingsAccountAustralia = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <SavingsAccountList />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default SavingsAccountAustralia;
