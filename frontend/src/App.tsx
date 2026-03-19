import './App.css'
import { useAccount, useReadContract } from 'wagmi';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage'
import OwnerDashboard from './components/OwnerDashboard';
import { vaultContractConfig } from './contracts/vault';

function App() {
  const { isConnected, address: user } = useAccount();
  const { data: owner } = useReadContract({
    ...vaultContractConfig,
    functionName: "owner",
  });

  const isOwner = user?.toLowerCase() === (owner as string | undefined)?.toLowerCase();

  let content;

  console.log("User:", user);
console.log("Owner:", owner);

  if (!isConnected) content = <LandingPage />;
  else if (isOwner) content = <OwnerDashboard />;
  else content = <Dashboard />;

  return (
    <div>{content}</div>
  );
}

export default App;
