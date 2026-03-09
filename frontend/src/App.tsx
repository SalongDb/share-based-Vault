import './App.css'
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage'
import Providers from './providers/WagmiProviders'

function App() {

  return (
    <div>
      <Providers>
        {/* <LandingPage></LandingPage> */}
        <Dashboard></Dashboard>
      </Providers>
    </div>
  )
}

export default App;
