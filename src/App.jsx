import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import StockDashboard     from './pages/StockDashboard.jsx';
import PortfolioAllocator from './pages/PortfolioAllocator.jsx';
import InvestmentMemo     from './pages/InvestmentMemo.jsx';

export default function App() {
  const [page, setPage] = useState('dashboard');
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar activePage={page} setActivePage={setPage} />
      <main className="max-w-7xl mx-auto px-4 py-10">
        {page === 'dashboard' && <StockDashboard />}
        {page === 'portfolio' && <PortfolioAllocator />}
        {page === 'memo'      && <InvestmentMemo />}
      </main>
    </div>
  );
}
