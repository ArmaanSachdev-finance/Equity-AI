import { Info } from 'lucide-react';
const METRICS = [
  { key:'priceEarningsRatio',   label:'P/E Ratio',    fmt:'x', tip:'Price ÷ earnings per share. Compare to sector average.' },
  { key:'earningsPerShare',     label:'EPS',           fmt:'$', tip:'Net income ÷ diluted shares outstanding.' },
  { key:'priceToSalesRatio',    label:'P/S Ratio',     fmt:'x', tip:'Market cap ÷ revenue. Useful for high-growth companies.' },
  { key:'priceToBookRatio',     label:'P/B Ratio',     fmt:'x', tip:'Market cap ÷ book value. Below 1 can signal undervaluation.' },
  { key:'grossProfitMargin',    label:'Gross Margin',  fmt:'%', tip:'Gross profit ÷ revenue. Reflects pricing power.' },
  { key:'netProfitMargin',      label:'Net Margin',    fmt:'%', tip:'Net income ÷ revenue. The true bottom-line profitability.' },
  { key:'operatingProfitMargin',label:'Op. Margin',    fmt:'%', tip:'Operating income ÷ revenue.' },
  { key:'returnOnEquity',       label:'ROE',           fmt:'%', tip:'Net income ÷ equity. Capital efficiency.' },
  { key:'returnOnAssets',       label:'ROA',           fmt:'%', tip:'Net income ÷ total assets.' },
  { key:'debtEquityRatio',      label:'Debt/Equity',   fmt:'x', tip:'Total debt ÷ equity. Higher = more leverage = more risk.' },
  { key:'currentRatio',         label:'Current Ratio', fmt:'x', tip:'Current assets ÷ current liabilities. Above 1 = healthy.' },
  { key:'freeCashFlowYield',    label:'FCF Yield',     fmt:'%', tip:'Free cash flow per share ÷ price.' },
];
const fmtVal=(v,fmt)=>{if(v==null||isNaN(v))return 'N/A';if(fmt==='%')return`${(v*100).toFixed(1)}%`;if(fmt==='$')return`$${v.toFixed(2)}`;return`${v.toFixed(2)}x`;};
const colour=(key,v)=>{if(v==null)return 'text-gray-500';const pos=['grossProfitMargin','netProfitMargin','operatingProfitMargin','returnOnEquity','returnOnAssets','currentRatio','freeCashFlowYield'];if(pos.includes(key))return v>0?'text-green-400':'text-red-400';if(key==='debtEquityRatio')return v>2?'text-red-400':'text-blue-300';return 'text-blue-300';};
export default function KeyRatios({ ratios, keyMetrics }) {
  const d = { ...(keyMetrics?.[0]??{}), ...(ratios?.[0]?? {}) };
  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold text-white">Key Ratios & Metrics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {METRICS.map(({key,label,fmt,tip})=>(
          <div key={key} className="group relative bg-gray-800/60 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">{label}</span>
              <Info size={11} className="text-gray-600 group-hover:text-gray-400 cursor-help transition-colors"/>
            </div>
            <div className={`text-lg font-bold ${colour(key,d[key])}`}>{fmtVal(d[key],fmt)}</div>
            <div className="absolute right-0 top-full mt-1 w-56 bg-gray-700 text-gray-200 text-xs p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl leading-relaxed">{tip}</div>
          </div>
        ))}
      </div>
      <p className="text-gray-600 text-xs">Hover any tile for a plain-English explanation.</p>
    </div>
  );
}
