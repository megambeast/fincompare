import React, { useState } from 'react';

const initialAccounts = [
  {
    name: 'Commonwealth Bank Business Transaction Account',
    fee: 10,
    feeDisplay: '$10/month',
    conditions: 'No monthly deposit requirement. Includes online banking and mobile app.',
    link: 'https://www.commbank.com.au/business/accounts/transaction-accounts.html',
  },
  {
    name: 'ANZ Business Advantage Account',
    fee: 0,
    feeDisplay: '$0/month',
    conditions: 'No monthly fee. Includes unlimited electronic transactions.',
    link: 'https://www.anz.com.au/business/accounts/transaction/advantage/',
  },
  {
    name: 'Westpac Business One Account',
    fee: 10,
    feeDisplay: '$10/month',
    conditions: 'Includes 25 free transactions per month. Online access.',
    link: 'https://www.westpac.com.au/business-banking/bank-accounts/transaction-accounts/business-one/',
  },
];

export default function BusinessAccountList() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = () => {
    const direction = sortDir === 'asc' ? 'desc' : 'asc';
    setSortDir(direction);
    const sorted = [...accounts].sort((a, b) =>
      direction === 'asc' ? a.fee - b.fee : b.fee - a.fee
    );
    setAccounts(sorted);
  };

  return (
    <section className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-10">
      <h2 className="text-xl font-bold px-6 pt-6 pb-2 text-[#1a365d]">Compare Business Bank Accounts</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 bg-gray-50 sticky left-0 z-10 border-r">Account</th>
              <th className="px-6 py-4 cursor-pointer" onClick={handleSort}>
                Monthly Fee
              </th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Link</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {accounts.map((account, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-[#1a365d] sticky left-0 bg-white border-r whitespace-nowrap">
                  {account.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{account.feeDisplay}</td>
                <td className="px-6 py-4 text-gray-600">{account.conditions}</td>
                <td className="px-6 py-4">
                  <a
                    href={account.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2c7a7b] hover:underline font-medium"
                  >
                    Visit Site
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
