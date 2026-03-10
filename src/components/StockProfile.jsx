import { TrendingUp, TrendingDown, Building2, Globe, Tag } from 'lucide-react';
const money = (n) => { if (n==null) return 'N/A'; if (Math.abs(n)>=1e12) return `$${(n/1e12).toFixed(2)}T`; if (Math.abs(n)>=1e9) return `$${(n/1e9).toFixed(2)}B`; if (Math.abs(n)>=1e6) return `$${(n/1e6).toFixed(2)}M`; return `$${n.toFixed(2)}`; };
export default function StockProfile({ profile, quote }) {
  if (!profile || !quote) return null;
  const up = (quote.change ?? 0) >= 0;
  return (
    <div className="card space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {profile.image && <img src={profile.image} alt={profile.symbol} className="w-12 h-12 rounded-xl bg-gray-800 object-contain p-1" />}
          <div>
            <h2 className="text-xl font-bold text-white">{profile.companyName}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-blue-400 font-mono font-semibold">{profile.symbol}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">{profile.exchangeShortName}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">{profile.currency}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">${quote.price?.toFixed(2)}</div>
          <div className={`flex items-center justify-end gap-1 text-sm font-semibold mt-1 ${up ? 'text-green-400' : 'text-red-400'}`}>
            {up ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
            {up ? '+' : ''}{quote.change?.toFixed(2)} ({up ? '+' : ''}{quote.changesPercentage?.toFixed(2)}%)
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-300"><Building2 size={11}/>{profile.sector}</span>
        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-300"><Tag size={11}/>{profile.industry}</span>
        {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-blue-400 transition-colors"><Globe size={11}/>Website ↗</a>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
        {[{label:'Market Cap',value:money(profile.mktCap)},{label:'52W High',value:`$${quote['52WeekHigh']?.toFixed(2)??'—'}`},{label:'52W Low',value:`$${quote['52WeekLow']?.toFixed(2)??'—'}`},{label:'Avg Volume',value:quote.avgVolume?`${(quote.avgVolume/1e6).toFixed(1)}M`:'—'}].map(({label,value})=>(
          <div key={label}><div className="text-gray-500 text-xs mb-1">{label}</div><div className="text-white font-semibold text-sm">{value}</div></div>
        ))}
      </div>
      {profile.description && <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 pt-4 border-t border-gray-800">{profile.description}</p>}
    </div>
  );
}
