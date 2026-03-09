import './App.css'
import LandingPage from './components/LandingPage'
import Providers from './providers/WagmiProviders'

function App() {

  return (
    <div>
      <Providers>
        <LandingPage></LandingPage>
      </Providers>
    </div>
  )
}

export default App;
