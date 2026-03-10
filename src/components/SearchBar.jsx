import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
const QUICK = ['AAPL','MSFT','GOOGL','AMZN','NVDA','TSLA','META','BRK.B'];
export default function SearchBar({ onSearch, loading }) {
  const [val, setVal] = useState('');
  const submit = (e) => { e.preventDefault(); const t = val.trim().toUpperCase(); if (t) onSearch(t); };
  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={val} onChange={(e) => setVal(e.target.value.toUpperCase())}
            placeholder="Enter a stock ticker — e.g. AAPL, MSFT, NVDA…"
            className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
        </div>
        <button type="submit" disabled={loading || !val.trim()} className="btn-primary px-7">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? 'Analysing…' : 'Analyse'}
        </button>
      </form>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-600 text-xs">Quick:</span>
        {QUICK.map(s => (
          <button key={s} onClick={() => { setVal(s); onSearch(s); }}
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs rounded-lg transition-colors">{s}</button>
        ))}
      </div>
    </div>
  );
}
