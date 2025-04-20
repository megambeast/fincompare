import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#1a365d] text-white py-10 px-6">
      <div className="max-w-5xl mx-auto text-sm text-gray-300">
        <p className="mb-4">
          © {new Date().getFullYear()} Savings Account Australia. All rights reserved.
        </p>
        <p>
          The information on this website is general in nature and doesn’t take into account your personal financial situation.
          Always read the terms and conditions and consider whether the product is right for you.
        </p>
      </div>
    </footer>
  );
}
