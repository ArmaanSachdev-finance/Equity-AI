import { BarChart2, PieChart, FileText, TrendingUp } from 'lucide-react';
const NAV = [
  { id: 'dashboard', label: 'Stock Analysis',     Icon: BarChart2 },
  { id: 'portfolio', label: 'Portfolio Allocator', Icon: PieChart  },
  { id: 'memo',      label: 'Investment Memo',     Icon: FileText  },
];
export default function Navbar({ activePage, setActivePage }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">Equity<span className="text-blue-400">AI</span></span>
        </div>
        <div className="flex gap-1">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActivePage(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activePage === id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
