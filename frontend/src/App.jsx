import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AssetOracleToken from './abi/AssetOracleToken.json';
import './App.css';

const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // ✅ AssetOracleToken
const vaultSwapAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'; // 🔁 Replace this with your actual VaultSwap address

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [balance, setBalance] = useState(null);
  const [approvalTx, setApprovalTx] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await _provider.send('eth_requestAccounts', []);
      const signer = await _provider.getSigner();
      setAccount(accounts[0]);
      setProvider(_provider);

      const contract = new ethers.Contract(tokenAddress, AssetOracleToken.abi, signer);
      setTokenContract(contract);
    } else {
      alert('Please install MetaMask!');
    }
  };

  const fetchBalance = async () => {
    if (tokenContract && account) {
      const rawBalance = await tokenContract.balanceOf(account);
      setBalance(ethers.formatUnits(rawBalance, 18));
    }
  };

  const approveSpending = async () => {
    try {
      const amount = ethers.parseUnits('1000000', 18); // Approve a large amount
      const tx = await tokenContract.approve(vaultSwapAddress, amount);
      setApprovalTx(tx.hash);
      await tx.wait();
      alert('Approval successful!');
    } catch (err) {
      console.error(err);
      alert('Approval failed.');
    }
  };

  useEffect(() => {
    if (tokenContract && account) {
      fetchBalance();
    }
  }, [tokenContract, account]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Oracle DApp</h1>

      {!account ? (
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-2">
            Connected Address: <span className="font-mono">{account}</span>
          </p>
          <p>
            RWA Token Balance: <strong>{balance ?? 'Loading...'}</strong>
          </p>

          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded" onClick={approveSpending}>
            Approve VaultSwap
          </button>

          {approvalTx && (
            <p className="mt-2 text-sm text-gray-600">
              Approval TX: <a className="underline" href={`https://sepolia.etherscan.io/tx/${approvalTx}`} target="_blank" rel="noopener noreferrer">{approvalTx}</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
