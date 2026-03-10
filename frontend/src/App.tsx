import './App.css'
import { useAccount } from 'wagmi';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage'

function App() {
  const { isConnected } = useAccount();

  return (
    <div>
      {isConnected ? <Dashboard /> : <LandingPage />}
    </div>
  )
}

export default App;
