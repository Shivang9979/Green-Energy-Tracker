import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../App';
import { toast } from 'react-toastify';

const ManageTokenURI = () => {
  const { contract, account } = useContext(Web3Context);
  const [formData, setFormData] = useState({
    tokenId: '',
    tokenURI: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [currentURI, setCurrentURI] = useState('');
  const [viewMode, setViewMode] = useState(false);

  // Sample metadata structure
  const generateSampleMetadata = (tokenId, creditDetails) => {
    return JSON.stringify(
      {
        name: `Carbon Credit #${tokenId}`,
        description: `Carbon credit from ${
          creditDetails?.source || 'Unknown Source'
        }`,
        attributes: [
          {
            trait_type: 'Amount',
            value: `${creditDetails?.amount || 0} tons CO2`,
          },
          {
            trait_type: 'Status',
            value: creditDetails?.isActive ? 'Active' : 'Used',
          },
        ],
      },
      null,
      2
    );
  };

  // Fetch owned tokens
  useEffect(() => {
    const fetchOwnedTokens = async () => {
      if (!contract || !account) return;

      try {
        const tokens = await contract.getCompanyTokens(account);
        const tokenDetails = await Promise.all(
          tokens.map(async (token) => {
            const details = await contract.getCreditDetails(token);
            return {
              id: token.toString(),
              amount: details[0].toString(),
              source: details[1],
              isActive: details[4],
            };
          })
        );
        setOwnedTokens(tokenDetails);
      } catch (error) {
        console.error('Error fetching owned tokens:', error);
      }
    };

    fetchOwnedTokens();
  }, [contract, account]);

  const fetchCurrentURI = async (tokenId) => {
    try {
      const uri = await contract.tokenURI(tokenId);
      setCurrentURI(uri);
      return uri;
    } catch (error) {
      console.error('Error fetching token URI:', error);
      setCurrentURI('');
      return '';
    }
  };

  const handleTokenSelect = async (token) => {
    setFormData({
      ...formData,
      tokenId: token.id,
    });
    await fetchCurrentURI(token.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      toast.error('Contract not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await contract.setTokenURI(
        formData.tokenId,
        formData.tokenURI
      );
      toast.info('Updating token URI...');
      await tx.wait();
      toast.success('Token URI updated successfully!');

      // Refresh the current URI
      await fetchCurrentURI(formData.tokenId);

      setFormData({ ...formData, tokenURI: '' });
    } catch (error) {
      console.error('Error updating token URI:', error);
      if (error.message.includes('Not token owner')) {
        toast.error("You don't own this token");
      } else {
        toast.error('Failed to update token URI: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndSetMetadata = async () => {
    const selectedToken = ownedTokens.find((t) => t.id === formData.tokenId);
    if (selectedToken) {
      const metadata = generateSampleMetadata(formData.tokenId, selectedToken);
      setFormData({ ...formData, tokenURI: metadata });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Manage Token URI</h2>

      {/* Owned Tokens Display */}
      {ownedTokens.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Your Tokens:</h3>
          <div className="flex flex-wrap gap-2">
            {ownedTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleTokenSelect(token)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  formData.tokenId === token.id
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 hover:bg-green-200 text-green-800'
                }`}
              >
                Token #{token.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View/Update Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode(false)}
          className={`px-4 py-2 rounded-md ${
            !viewMode ? 'bg-green-600 text-white' : 'bg-gray-100'
          }`}
        >
          Update URI
        </button>
        <button
          onClick={() => setViewMode(true)}
          className={`px-4 py-2 rounded-md ${
            viewMode ? 'bg-green-600 text-white' : 'bg-gray-100'
          }`}
        >
          View Current URI
        </button>
      </div>

      {viewMode ? (
        // View Mode
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Token ID
            </label>
            <input
              type="number"
              value={formData.tokenId}
              onChange={(e) => {
                setFormData({ ...formData, tokenId: e.target.value });
                fetchCurrentURI(e.target.value);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              min="1"
              step="1"
            />
          </div>
          {currentURI && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-700 mb-2">Current URI:</h4>
              <pre className="whitespace-pre-wrap bg-white p-3 rounded border text-sm">
                {currentURI}
              </pre>
            </div>
          )}
        </div>
      ) : (
        // Update Mode
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Token ID
            </label>
            <input
              type="number"
              value={formData.tokenId}
              onChange={(e) =>
                setFormData({ ...formData, tokenId: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
              min="1"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Token URI
            </label>
            <textarea
              value={formData.tokenURI}
              onChange={(e) =>
                setFormData({ ...formData, tokenURI: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 h-32"
              required
            />
          </div>

          {/* Generate Sample Metadata Button */}
          <button
            type="button"
            onClick={generateAndSetMetadata}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 mb-2"
          >
            Generate Sample Metadata
          </button>

          <button
            type="submit"
            className={`w-full bg-green-600 text-white py-2 px-4 rounded-md
              transition-all duration-200 ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-green-700 active:bg-green-800'
              }`}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update URI'}
          </button>
        </form>
      )}

      {/* Help Text */}
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">About Token URIs:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Token URI points to metadata about your carbon credit</li>
          <li>
            Typically contains information like name, description, and
            attributes
          </li>
          <li>
            Can be used to store additional details about the credit source
          </li>
          <li>Only the token owner can update its URI</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageTokenURI;
