// import React, { useState, useContext } from 'react';
// import { Web3Context } from '../App';
// import { toast } from 'react-toastify';

// const RecordEmission = () => {
//   const { contract } = useContext(Web3Context);
//   const [amount, setAmount] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const tx = await contract.recordEmission(amount);
//       await tx.wait();
//       toast.success('Emission recorded successfully!');
//       setAmount('');
//     } catch (error) {
//       toast.error('Failed to record emission: ' + error.message);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4">Record Emission</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Emission Amount (CO2 tons)
//           </label>
//           <input
//             type="number"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
//         >
//           Record Emission
//         </button>
//       </form>
//     </div>
//   );
// };

// export default RecordEmission;

import React, { useState, useContext } from 'react';
import { Web3Context } from '../App';
import { toast } from 'react-toastify';

const RecordEmission = () => {
  const { contract } = useContext(Web3Context);
  const [amount, setAmount] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const tx = await contract.recordEmission(amount);
      await tx.wait();
      toast.success('Emission recorded successfully!');
      setAmount('');
    } catch (error) {
      toast.error('Failed to record emission: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleEmissions = [
    { label: 'Small Office', amount: '5' },
    { label: 'Manufacturing Plant', amount: '100' },
    { label: 'Large Corporation', amount: '500' },
  ];

  const applyExample = (example) => {
    setAmount(example.amount);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Record Emission</h2>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-green-600 hover:text-green-800"
        >
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-green-50 rounded-md">
          <h3 className="font-semibold mb-2">How to Record Emissions:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-medium">Amount:</span> Enter the emission in
              tons of CO2 (e.g., 5 for 5 tons of CO2).
            </li>
            <li>
              You can also select an example emission level below to quickly
              fill in typical values.
            </li>
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Example Emission Levels:</h3>
        <div className="flex flex-wrap gap-2">
          {exampleEmissions.map((example) => (
            <button
              key={example.label}
              onClick={() => applyExample(example)}
              className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Emission Amount (CO2 tons)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="e.g., 10"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the emission level in tons of CO2.
          </p>
        </div>

        <button
          type="submit"
          className={`w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Recording...' : 'Record Emission'}
        </button>
      </form>
    </div>
  );
};

export default RecordEmission;
