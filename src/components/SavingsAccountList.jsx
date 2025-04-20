import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const initialAccounts = [
  {
    name: 'ING Savings Maximiser',
    rate: 5.4,
    rateDisplay: '5.4% p.a.',
    conditions: 'Deposit $1,000, make 5+ card purchases, and grow your balance each month.',
    score: 9.7,
    link: 'https://www.ing.com.au/savings/savings-maximiser.html',
  },
  {
    name: 'Ubank Save Account',
    rate: 5.1,
    rateDisplay: '5.1% p.a.',
    conditions: 'Deposit $500 per month.',
    score: 9.4,
    link: 'https://www.ubank.com.au/save',
  },
  {
    name: 'Macquarie Bank Savings Account',
    rate: 5.35,
    rateDisplay: '5.35% p.a.',
    conditions: 'No monthly deposit conditions.',
    score: 9.5,
    link: 'https://www.macquarie.com.au/bank-accounts/savings.html',
  },
];

export default function SavingsAccountList() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    const direction = sortBy === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(key);
    setSortDir(direction);
    const sorted = [...accounts].sort((a, b) => {
      return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
    });
    setAccounts(sorted);
  };

  const SortIcon = ({ dir }) =>
    dir === 'asc' ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />;

  return (
    <section className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-10">
      <h2 className="text-xl font-bold px-6 pt-6 pb-2 text-[#1a365d]">Compare Savings Accounts</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 bg-gray-50 whitespace-nowrap sticky left-0 z-10 border-r">Account</th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('rate')}>
                Interest Rate {sortBy === 'rate' && <SortIcon dir={sortDir} />}
              </th>
              <th className="px-6 py-4">Conditions</th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('score')}>
                Finder Score {sortBy === 'score' && <SortIcon dir={sortDir} />}
              </th>
              <th className="px-6 py-4">Link</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {accounts.map((account, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-[#1a365d] sticky left-0 bg-white border-r whitespace-nowrap">
                  {account.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{account.rateDisplay}</td>
                <td className="px-6 py-4 text-gray-600">{account.conditions}</td>
                <td className="px-6 py-4 font-semibold">{account.score}</td>
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
