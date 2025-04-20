import React from 'react';

export default function FAQSection() {
  return (
    <section className="bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-6 text-[#1a365d]">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800">What’s a high interest savings account?</h4>
            <p className="text-gray-600">A high interest savings account is a bank account that offers interest rates higher than standard savings accounts, helping your money grow faster.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">How do I get the bonus interest?</h4>
            <p className="text-gray-600">Bonus interest is usually conditional. You might need to deposit a minimum amount, make no withdrawals, or meet other monthly criteria.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Are online banks safe?</h4>
            <p className="text-gray-600">Yes. As long as they’re backed by an Australian banking licence (ADI), your deposits up to $250,000 are protected by the Australian government’s deposit guarantee.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
