import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../App';
import { toast } from 'react-toastify';

const OffsetEmissions = () => {
  const { contract, account } = useContext(Web3Context);
  const [tokenId, setTokenId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [currentEmissions, setCurrentEmissions] = useState('0');
  const [selectedTokenDetails, setSelectedTokenDetails] = useState(null);

  // Fetch owned tokens and current emissions
  useEffect(() => {
    const fetchData = async () => {
      if (!contract || !account) return;

      try {
        const tokens = await contract.getCompanyTokens(account);
        const activeTokens = [];

        // Check each token's status
        for (const token of tokens) {
          const details = await contract.getCreditDetails(token);
          if (details[4]) {
            // if token is active
            activeTokens.push({
              id: token.toString(),
              amount: details[0].toString(),
              source: details[1],
            });
          }
        }

        setOwnedTokens(activeTokens);

        // Fetch current emissions
        const emissions = await contract.getEmissions(account);
        setCurrentEmissions(emissions.toString());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [contract, account]);

  const handleTokenSelect = async (tokenId) => {
    setTokenId(tokenId);
    try {
      const details = await contract.getCreditDetails(tokenId);
      setSelectedTokenDetails({
        amount: details[0].toString(),
        source: details[1],
      });
    } catch (error) {
      console.error('Error fetching token details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      toast.error('Contract not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await contract.offsetEmissions(tokenId);
      toast.info('Processing offset transaction...');
      await tx.wait();
      toast.success('Emissions offset successfully!');

      // Refresh data
      setTokenId('');
      setSelectedTokenDetails(null);
      const emissions = await contract.getEmissions(account);
      setCurrentEmissions(emissions.toString());

      // Refresh owned tokens
      const tokens = await contract.getCompanyTokens(account);
      const activeTokens = [];
      for (const token of tokens) {
        const details = await contract.getCreditDetails(token);
        if (details[4]) {
          activeTokens.push({
            id: token.toString(),
            amount: details[0].toString(),
            source: details[1],
          });
        }
      }
      setOwnedTokens(activeTokens);
    } catch (error) {
      console.error('Error offsetting emissions:', error);
      if (error.message.includes('Insufficient emissions')) {
        toast.error(
          "You don't have enough emissions to offset with this credit"
        );
      } else if (error.message.includes('Not token owner')) {
        toast.error("You don't own this carbon credit token");
      } else if (error.message.includes('Credit not active')) {
        toast.error('This credit has already been used');
      } else {
        toast.error('Failed to offset emissions: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Offset Emissions</h2>

      {/* Current Emissions Display */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800">
          Current Emissions
        </h3>
        <p className="text-2xl font-bold text-green-900">
          {currentEmissions} tons CO2
        </p>
      </div>

      {/* Available Credits */}
      {ownedTokens.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Available Carbon Credits:</h3>
          <div className="flex flex-wrap gap-2">
            {ownedTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleTokenSelect(token.id)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  tokenId === token.id
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 hover:bg-green-200 text-green-800'
                }`}
              >
                Token #{token.id} ({token.amount} tons)
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Token ID to Offset
          </label>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => handleTokenSelect(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
            min="1"
            step="1"
          />
        </div>

        {/* Selected Token Details */}
        {selectedTokenDetails && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-700">
              Selected Credit Details:
            </h4>
            <p className="text-sm text-gray-600">
              Amount: {selectedTokenDetails.amount} tons CO2
            </p>
            <p className="text-sm text-gray-600">
              Source: {selectedTokenDetails.source}
            </p>
          </div>
        )}

        <button
          type="submit"
          className={`w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium
            transition-all duration-200 ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-green-700 active:bg-green-800'
            }`}
          disabled={isLoading || !contract}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Offset Emissions'
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">How Offsetting Works:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Select a carbon credit token you own</li>
          <li>
            The credit amount will be deducted from your recorded emissions
          </li>
          <li>Once used, a credit token cannot be used again</li>
          <li>You must have sufficient emissions recorded to use a credit</li>
        </ul>
      </div>
    </div>
  );
};

export default OffsetEmissions;
