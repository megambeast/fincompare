import React from 'react';

export default function HeroSection() {
  return (
    <section className="bg-[#f0f4f8] py-10 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#1a365d]">Best High Interest Savings Accounts</h2>
        <p className="text-gray-700 text-lg mb-4">
          We've compared interest rates, bonus conditions, fees, and features to help you find the best savings account in Australia.
        </p>
        <p className="text-sm text-gray-500">Updated: {new Date().toLocaleDateString()}</p>
      </div>
    </section>
  );
}
