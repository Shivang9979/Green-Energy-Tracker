import React, { useState, useContext } from 'react';
import { Web3Context } from '../App';
import { toast } from 'react-toastify';

export const MintCarbonCredit = () => {
  const { contract, account } = useContext(Web3Context);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    emissionData: '',
  });
  const [lastMintedId, setLastMintedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const tx = await contract.mintCredit(
        formData.amount,
        formData.source,
        formData.emissionData
      );

      // wait for transaction to be mined
      const receipt = await tx.wait();

      // Find the CreditMinted event in the receipt
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === 'CreditMinted'
      );

      if (event) {
        const tokenId = event.args[0]; // First argument is tokenId
        setLastMintedId(tokenId.toString());
        toast.success(
          `Carbon credit minted successfully! Token ID: ${tokenId}`
        );
      }

      setFormData({ amount: '', source: '', emissionData: '' });
    } catch (error) {
      toast.error('Failed to mint credit: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleProjects = [
    {
      name: 'Solar Farm',
      amount: '10',
      source: 'Solar Farm Alpha',
      emissionData: '11957',
    },
    {
      name: 'Wind Project',
      amount: '25',
      source: 'Wind Turbines Beta',
      emissionData: '27500',
    },
    {
      name: 'Reforestation',
      amount: '5',
      source: 'Forest Project Gamma',
      emissionData: '5000',
    },
  ];

  const applySampleProject = (project) => {
    setFormData({
      amount: project.amount,
      source: project.source,
      emissionData: project.emissionData,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mint Carbon Credit</h2>
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
          <h3 className="font-semibold mb-2">How to Fill This Form:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-medium">Amount:</span> The quantity of CO2
              offset in metric tons (e.g., 10 tons)
            </li>
            <li>
              <span className="font-medium">Source:</span> The project or
              initiative that generated the offset (e.g., "Solar Farm Alpha")
            </li>
            <li>
              <span className="font-medium">Emission Data:</span> The raw data
              supporting your offset claim (e.g., kWh generated * 0.92)
            </li>
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Quick Fill Templates:</h3>
        <div className="flex flex-wrap gap-2">
          {sampleProjects.map((project) => (
            <button
              key={project.name}
              onClick={() => applySampleProject(project)}
              className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
            >
              {project.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount (CO2 tons)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="e.g., 10"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the amount of CO2 offset in metric tons
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="e.g., Solar Farm Alpha"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the name or description of your carbon offset project
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Emission Data
          </label>
          <input
            type="number"
            value={formData.emissionData}
            onChange={(e) =>
              setFormData({ ...formData, emissionData: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="e.g., 11957"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the supporting data for your offset (e.g., kWh * 0.92)
          </p>
        </div>

        {lastMintedId && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <h3 className="font-semibold text-green-800">Last Minted Token</h3>
            <p className="text-green-700">Token ID: {lastMintedId}</p>
            <button
              onClick={() => navigator.clipboard.writeText(lastMintedId)}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              Copy Token ID
            </button>
          </div>
        )}

        <button
          type="submit"
          className={`w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Minting...' : 'Mint Credit'}
        </button>
      </form>
    </div>
  );
};

export default MintCarbonCredit;
