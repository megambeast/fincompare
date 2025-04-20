import React from 'react';

const savingsAccounts = [
  {
    name: 'ING Savings Maximiser',
    rate: '5.4% p.a.',
    conditions: 'Deposit $1,000, make 5+ card purchases, and grow your balance each month.',
    finderScore: 9.7,
    link: 'https://www.ing.com.au/savings/savings-maximiser.html',
  },
  {
    name: 'Ubank Save Account',
    rate: '5.1% p.a.',
    conditions: 'Deposit $500 per month.',
    finderScore: 9.4,
    link: 'https://www.ubank.com.au/save',
  },
  // Add more accounts as needed
];

const SavingsAccountList = () => {
  return (
    <section>
      <h2>Compare Savings Accounts</h2>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Interest Rate</th>
            <th>Conditions</th>
            <th>Finder Score</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {savingsAccounts.map((account, index) => (
            <tr key={index}>
              <td>{account.name}</td>
              <td>{account.rate}</td>
              <td>{account.conditions}</td>
              <td>{account.finderScore}</td>
              <td>
                <a href={account.link} target="_blank" rel="noopener noreferrer">
                  Visit Site
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default SavingsAccountList;
