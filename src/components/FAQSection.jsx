import React from 'react';

export default function FAQSection() {
  return (
    <section className="bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-6 text-[#1a365d]">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800">What is a business bank account?</h4>
            <p className="text-gray-600">
              A business bank account is used to manage your company’s finances separately from your personal money. It helps with tracking expenses, receiving payments, and managing tax obligations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Do I need a business account to operate as a sole trader?</h4>
            <p className="text-gray-600">
              Legally, you don’t have to have a separate account as a sole trader, but it’s strongly recommended for better bookkeeping and tax management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">What fees should I look out for?</h4>
            <p className="text-gray-600">
              Watch out for monthly account fees, excess transaction charges, ATM fees, and charges for international payments. Some accounts waive fees if you meet certain conditions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
