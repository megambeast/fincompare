import React, { useState } from 'react';

const initialAccounts = [
  {
    name: 'Commonwealth Bank Business Transaction Account',
    brand: 'Commonwealth Bank',
    fee: 10,
    feeDisplay: '$10/month',
    conditions: 'No monthly deposit requirement. Includes online banking and mobile app.',
    features: ['online banking', 'mobile app'],
    link: 'https://www.commbank.com.au/business/accounts/transaction-accounts.html',
  },
  {
    name: 'ANZ Business Advantage Account',
    brand: 'ANZ',
    fee: 0,
    feeDisplay: '$0/month',
    conditions: 'No monthly fee. Includes unlimited electronic transactions.',
    features: ['unlimited transactions', 'electronic banking'],
    link: 'https://www.anz.com.au/business/accounts/transaction/advantage/',
  },
  {
    name: 'Westpac Business One Account',
    brand: 'Westpac',
    fee: 10,
    feeDisplay: '$10/month',
    conditions: 'Includes 25 free transactions per month. Online access.',
    features: ['free transactions', 'online access'],
    link: 'https://www.westpac.com.au/business-banking/bank-accounts/transaction-accounts/business-one/',
  },
  {
    name: 'NAB Business Everyday Account',
    brand: 'NAB',
    fee: 0,
    feeDisplay: '$0/month',
    conditions: 'No monthly fees. Basic features for sole traders.',
    features: ['no fee', 'basic account'],
    link: 'https://www.nab.com.au/business/bank-accounts/everyday-accounts/business-everyday-account',
  },
  {
    name: 'Macquarie Business Transaction Account',
    brand: 'Macquarie',
    fee: 0,
    feeDisplay: '$0/month',
    conditions: 'Online-only account with good digital tools.',
    features: ['digital tools', 'online only'],
    link: 'https://www.macquarie.com.au/business-banking/accounts.html',
  },
  {
    name: 'Bendigo Bank Business Account',
    brand: 'Bendigo Bank',
    fee: 12,
    feeDisplay: '$12/month',
    conditions: 'In-branch access and community focus.',
    features: ['branch access', 'community bank'],
    link: 'https://www.bendigobank.com.au/business/bank-accounts/transaction-accounts/',
  },
  {
    name: 'BOQ Business Day2Day Account',
    brand: 'BOQ',
    fee: 10,
    feeDisplay: '$10/month',
    conditions: 'Flexible access and daily transaction tools.',
    features: ['daily transactions', 'flexible access'],
    link: 'https://www.boq.com.au/business/banking/accounts',
  },
  {
    name: 'HSBC Business Transaction Account',
    brand: 'HSBC',
    fee: 15,
    feeDisplay: '$15/month',
    conditions: 'Global bank with business insights tools.',
    features: ['international tools', 'business insights'],
    link: 'https://www.hsbc.com.au/business/',
  },
  {
    name: 'Suncorp Business Premium Account',
    brand: 'Suncorp',
    fee: 10,
    feeDisplay: '$10/month',
    conditions: 'Includes business reporting tools.',
    features: ['reporting', 'business tools'],
    link: 'https://www.suncorp.com.au/banking/business/bank-accounts.html',
  },
  {
    name: 'ME Bank Business Account',
    brand: 'ME Bank',
    fee: 8,
    feeDisplay: '$8/month',
    conditions: 'Simple account with no extras.',
    features: ['low cost', 'no extras'],
    link: 'https://www.mebank.com.au/business/',
  }
];

export default function BusinessAccountList() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [sortDir, setSortDir] = useState('asc');
  const [feeFilter, setFeeFilter] = useState('');
  const [featureFilter, setFeatureFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const handleSort = () => {
    const direction = sortDir === 'asc' ? 'desc' : 'asc';
    setSortDir(direction);
    const sorted = [...accounts].sort((a, b) =>
      direction === 'asc' ? a.fee - b.fee : b.fee - a.fee
    );
    setAccounts(sorted);
  };

  const filteredAccounts = accounts.filter(account => {
    const feeMatch = feeFilter === '' || account.fee === Number(feeFilter);
    const featureMatch =
      featureFilter === '' || account.features?.some(f =>
        f.toLowerCase().includes(featureFilter)
      );
    const brandMatch = brandFilter === '' || account.brand.toLowerCase() === brandFilter.toLowerCase();
    return feeMatch && featureMatch && brandMatch;
  });

  const uniqueBrands = [...new Set(initialAccounts.map(acc => acc.brand))];

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto mt-10">
      <aside className="w-full md:w-64 bg-white p-4 border rounded-lg shadow mb-4 md:mb-0 md:mr-6">
        <h3 className="font-bold text-lg mb-2">Filter by</h3>

        <div className="mb-4">
          <label className="font-medium block mb-1">Monthly Fee</label>
          <select
            onChange={(e) => setFeeFilter(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">All</option>
            <option value="0">$0</option>
            <option value="8">$8</option>
            <option value="10">$10</option>
            <option value="12">$12</option>
            <option value="15">$15</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="font-medium block mb-1">Feature</label>
          <input
            type="text"
            placeholder="e.g. unlimited"
            onChange={(e) => setFeatureFilter(e.target.value.toLowerCase())}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="font-medium block mb-1">Brand</label>
          <select
            onChange={(e) => setBrandFilter(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">All</option>
            {uniqueBrands.map((brand, idx) => (
              <option key={idx} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </aside>

      <section className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
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
              {filteredAccounts.map((account, idx) => (
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
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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
    </div>
  );
}
