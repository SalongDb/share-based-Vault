import './App.css'
import { useAccount, useReadContract } from 'wagmi';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage'
import OwnerDashboard from './components/OwnerDashboard';
import { vaultContractConfig } from './contracts/vault';
import { Toaster } from "react-hot-toast";

function App() {
  // Get wallet connection status and user address
  const { isConnected, address: user } = useAccount();

  // Read contract owner address
  const { data: owner } = useReadContract({
    ...vaultContractConfig,
    functionName: "owner",
  });

  // Check if connected user is the contract owner
  const isOwner = user?.toLowerCase() === (owner as string | undefined)?.toLowerCase();

  let content;

  // Conditional rendering based on connection + role
  if (!isConnected) content = <LandingPage />;
  else if (isOwner) content = <OwnerDashboard />;
  else content = <Dashboard />;

  return (
    <>
      <div>{content}</div>

      {/* Global toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
            borderRadius: "10px",
          },
        }}
      />
    </>
  );
}

export default App;