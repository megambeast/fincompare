import React, { useState, useEffect } from 'react';
import { Search, Check, ExternalLink } from 'lucide-react';

const sampleAccounts = [
  {
    id: 's1',
    name: 'High Interest Saver',
    provider: 'Aussie Bank',
    logo: 'https://via.placeholder.com/150x50?text=Aussie+Bank',
    interestRate: '5.00% p.a.',
    ongoingRate: '2.00% p.a.',
    minDeposit: 1000,
    features: ['Bonus interest', 'Online only', 'No monthly fees'],
    rating: 4.6,
    reviews: 180,
    promos: '5.00% p.a. for first 4 months'
  },
  {
    id: 's2',
    name: 'Smart Savings Account',
    provider: 'SmartBank',
    logo: 'https://via.placeholder.com/150x50?text=SmartBank',
    interestRate: '4.75% p.a.',
    ongoingRate: '2.25% p.a.',
    minDeposit: 500,
    features: ['Auto transfer', 'Mobile app'],
    rating: 4.3,
    reviews: 92,
    promos: 'No minimum balance required'
  },
  {
    id: 's3',
    name: 'Everyday Saver',
    provider: 'DailyBank',
    logo: 'https://via.placeholder.com/150x50?text=DailyBank',
    interestRate: '4.00% p.a.',
    ongoingRate: '4.00% p.a.',
    minDeposit: 0,
    features: ['Fee-free', 'Instant transfers'],
    rating: 4.0,
    reviews: 56,
    promos: 'No fees ever'
  }
];

export default function SavingsHome() {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setAccounts(sampleAccounts); // Simulate API call
  }, []);

  const filtered = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-sm">
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-[#1a365d]">Savings Account Australia</h1>
        <p className="text-gray-600">Compare high interest savings accounts in one place</p>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex mb-6">
          <div className="flex items-center bg-white p-3 rounded shadow w-full">
            <Search className="text-gray-400 mr-2" />
            <input
              className="flex-1 outline-none"
              placeholder="Search accounts or banks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filtered.map(account => (
            <div
              key={account.id}
              className={`bg-white rounded-lg shadow-md p-5 transition border-2 ${selected.includes(account.id) ? 'border-[#2c7a7b]' : 'border-transparent'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img src={account.logo} alt={account.provider} className="h-10" />
                  <div>
                    <h2 className="font-semibold text-lg">{account.name}</h2>
                    <p className="text-gray-500">{account.provider}</p>
                  </div>
                </div>
                <div>
                  <button
                    className={`text-sm px-3 py-1 rounded border ${
                      selected.includes(account.id)
                        ? 'bg-[#2c7a7b] text-white border-[#2c7a7b]'
                        : 'text-[#2c7a7b] border-[#2c7a7b]'
                    }`}
                    onClick={() => toggleSelect(account.id)}
                  >
                    {selected.includes(account.id) ? 'Selected' : 'Compare'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-gray-500">Intro Rate</div>
                  <div className="font-medium">{account.interestRate}</div>
                </div>
                <div>
                  <div className="text-gray-500">Ongoing Rate</div>
                  <div className="font-medium">{account.ongoingRate}</div>
                </div>
                <div>
                  <div className="text-gray-500">Min Deposit</div>
                  <div className="font-medium">${account.minDeposit}</div>
                </div>
                <div>
                  <div className="text-gray-500">Rating</div>
                  <div className="font-medium">{account.rating} ★</div>
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-2">
                {account.promos && (
                  <div className="bg-yellow-100 text-yellow-800 inline-block px-2 py-1 rounded mb-2">
                    {account.promos}
                  </div>
                )}
              </div>

              <ul className="text-sm text-gray-600 flex flex-wrap gap-2">
                {account.features.map(f => (
                  <li key={f} className="bg-gray-100 px-2 py-1 rounded flex items-center">
                    <Check size={14} className="text-green-600 mr-1" /> {f}
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <button
                  className="text-white bg-[#2c7a7b] px-4 py-2 rounded hover:bg-[#1d5354] flex items-center"
                  onClick={() => alert(`Redirecting to ${account.provider}...`)}
                >
                  Apply now <ExternalLink size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white text-gray-500 py-6 text-center border-t mt-12 text-sm">
        © {new Date().getFullYear()} Savings Account Australia. All rights reserved.
      </footer>
    </div>
  );
}
