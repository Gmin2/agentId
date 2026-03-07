import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Explorer } from './pages/Explorer';
import { AgentDetail } from './pages/AgentDetail';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Preloader } from './components/Preloader';
import { WalletProvider } from './lib/wallet';

export function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Preloader />
        <div className="min-h-screen bg-base text-fg p-4 md:p-8 font-mono flex flex-col max-w-7xl mx-auto">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/agents" element={<Explorer />} />
              <Route path="/agents/:atomId" element={<AgentDetail />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}
