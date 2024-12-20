// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import Header from './components/Header';
import RecordEmission from './components/RecordEmission';
import MintCarbonCredit from './components/MintCarbonCredit';
import ViewToken from './components/ViewToken';
import OffsetEmissions from './components/OffsetEmissions';
import ManageTokenURI from './components/ManageTokenURI';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the contract ABI
import contractABI from './contracts/CarbonCreditToken.json';

// Create Web3 context
export const Web3Context = React.createContext();

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Replace with your deployed contract address from truffle migrate
  const contractAddress = '0x2F2411C12F0B8CC4e73Bb302eAf355e68b690E3a';

  // Hardcoded wallet address
  const hardcodedAccount = '0x0A77CDeB0796d1d629B9077DCc0163d071cf9d71';

  const detectMetaMask = () => {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
      return ethereum;
    }
    return null;
  };

  const connectWallet = async () => {
    const metamask = detectMetaMask();

    if (!metamask) {
      toast.error('Please install MetaMask!');
      return;
    }
    // if (typeof window.ethereum === 'undefined') {
    //   toast.error('Please install MetaMask!');
    //   return;
    // }

    // Initialize provider and signer
    const web3Provider = new BrowserProvider(window.ethereum);
    setProvider(web3Provider);

    const web3Signer = await web3Provider.getSigner();
    setSigner(web3Signer);

    // Set the hardcoded account
    setAccount(hardcodedAccount);

    // Create contract instance
    const contractInstance = new Contract(
      contractAddress,
      contractABI.abi,
      web3Signer
    );
    setContract(contractInstance);
    setIsConnected(true);
    toast.success('Connected to the wallet successfully!');
  };

  useEffect(() => {
    if (!isConnected) {
      connectWallet();
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [isConnected]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
      }}
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <RecordEmission />
              <MintCarbonCredit />
            </div>
            <div className="space-y-6">
              <ViewToken />
              <OffsetEmissions />
              <ManageTokenURI />
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-gray-600">
          <p>Green Energy Tracker - Carbon Credit Management System</p>
        </footer>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Web3Context.Provider>
  );
}

export default App;
