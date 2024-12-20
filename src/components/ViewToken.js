import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../App';
import { toast } from 'react-toastify';

const ViewToken = () => {
  const { contract, account } = useContext(Web3Context);
  const [tokenId, setTokenId] = useState('');
  const [tokenDetails, setTokenDetails] = useState(null);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to safely convert BigInt to string
  const formatBigInt = (value) => {
    try {
      // Check if the value is BigInt or can be converted to it
      return Number(value).toString();
    } catch (error) {
      console.error('Error formatting BigInt:', error);
      return '0';
    }
  };

  // Fetch owned tokens when component mounts
  useEffect(() => {
    const fetchOwnedTokens = async () => {
      if (!contract || !account) return;

      try {
        const tokens = await contract.getCompanyTokens(account);
        setOwnedTokens(tokens.map((token) => formatBigInt(token)));
      } catch (error) {
        console.error('Error fetching owned tokens:', error);
        toast.error('Failed to fetch owned tokens');
      }
    };

    if (account) {
      fetchOwnedTokens();
    }
  }, [contract, account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      toast.error('Contract not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const details = await contract.getCreditDetails(tokenId);
      setTokenDetails({
        amount: formatBigInt(details[0]),
        source: details[1],
        timestamp: new Date(
          Number(formatBigInt(details[2])) * 1000
        ).toLocaleString(),
        emissionData: formatBigInt(details[3]),
        isActive: details[4],
      });
    } catch (error) {
      console.error('Error fetching token details:', error);
      toast.error(
        error.message.includes("Token doesn't exist")
          ? 'Token not found'
          : 'Failed to fetch token details'
      );
      setTokenDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">View Token Details</h2>

      {ownedTokens.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Your Tokens:</h3>
          <div className="flex flex-wrap gap-2">
            {ownedTokens.map((token) => (
              <button
                key={token}
                onClick={() => setTokenId(token)}
                className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                Token #{token}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Token ID
          </label>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
            min="1"
            step="1"
          />
        </div>
        <button
          type="submit"
          className={`w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading || !contract}
        >
          {isLoading ? 'Loading...' : 'View Details'}
        </button>
      </form>

      {tokenDetails && (
        <div className="mt-6 space-y-2 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold">Token Details:</h3>
          <p>
            <span className="font-medium">Amount:</span> {tokenDetails.amount}{' '}
            CO2 tons
          </p>
          <p>
            <span className="font-medium">Source:</span> {tokenDetails.source}
          </p>
          <p>
            <span className="font-medium">Timestamp:</span>{' '}
            {tokenDetails.timestamp}
          </p>
          <p>
            <span className="font-medium">Emission Data:</span>{' '}
            {tokenDetails.emissionData}
          </p>
          <p>
            <span className="font-medium">Status:</span>{' '}
            <span
              className={`${
                tokenDetails.isActive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {tokenDetails.isActive ? 'Active' : 'Used'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewToken;
