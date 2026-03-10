import { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
const REC_STYLE={BUY:'badge-buy',HOLD:'badge-hold',SELL:'badge-sell'};
const CONF_COLOR={HIGH:'text-green-400',MEDIUM:'text-yellow-400',LOW:'text-red-400'};
export default function AISummary({stockData,dcfResult}){
  const [analysis,setAnalysis]=useState(null);const [loading,setLoading]=useState(false);const [error,setError]=useState(null);
  const generate=async()=>{
    setLoading(true);setError(null);
    try{
      const res=await fetch('/api/ai/summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({stockData,dcfResult})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'Failed');
      setAnalysis(data);
    }catch(err){setError(err.message||'Failed to generate analysis.');}
    finally{setLoading(false);}
  };
  const sections=analysis?[{icon:'💰',label:'Financial Health',body:analysis.financialHealth},{icon:'📈',label:'Growth Outlook',body:analysis.growthOutlook},{icon:'⚖️',label:'Valuation',body:analysis.valuation},{icon:'✅',label:'Recommendation Rationale',body:analysis.recommendationRationale}]:[];
  return(
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Sparkles size={20} className="text-purple-400"/><h3 className="text-lg font-semibold text-white">AI Analysis</h3><span className="text-xs bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded-full">Claude Sonnet</span></div>
        {analysis&&!loading&&<button onClick={generate} title="Regenerate" className="text-gray-600 hover:text-gray-300 transition-colors"><RefreshCw size={14}/></button>}
      </div>
      {!analysis&&!loading&&!error&&(
        <div className="text-center py-10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto"><Sparkles size={28} className="text-purple-400"/></div>
          <div><p className="text-gray-300 font-medium">Generate AI-Powered Investment Analysis</p><p className="text-gray-500 text-sm mt-1">Claude will synthesise the financials and DCF into a structured investment thesis.</p></div>
          <button onClick={generate} className="btn-primary mx-auto bg-purple-600 hover:bg-purple-500 border-0 px-6 py-2.5"><Sparkles size={14}/>Generate Analysis</button>
        </div>
      )}
      {loading&&<div className="flex flex-col items-center justify-center py-12 gap-3"><Loader2 size={32} className="animate-spin text-purple-400"/><p className="text-gray-400 text-sm">Claude is analysing the financials…</p></div>}
      {error&&!loading&&<div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4"><AlertTriangle size={17} className="text-red-400 mt-0.5 shrink-0"/><div><p className="text-red-400 text-sm font-medium">Analysis Failed</p><p className="text-red-300/70 text-xs mt-1">{error}</p><button onClick={generate} className="text-red-400 text-xs underline mt-2">Try again</button></div></div>}
      {analysis&&!loading&&(
        <div className="space-y-5">
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-3"><p className="text-white font-medium leading-relaxed">{analysis.headline}</p><div className="flex items-center gap-3 flex-wrap"><span className={REC_STYLE[analysis.recommendation]??'badge-hold'}>{analysis.recommendation}</span><span className={`text-xs ${CONF_COLOR[analysis.confidenceLevel]??'text-gray-400'}`}>{analysis.confidenceLevel} Confidence</span></div></div>
          {sections.map(({icon,label,body})=>(<div key={label} className="space-y-1.5"><h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{icon} {label}</h5><p className="text-gray-300 text-sm leading-relaxed">{body}</p></div>))}
          {analysis.risks?.length>0&&<div className="space-y-2"><h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">⚠️ Key Risks</h5><ul className="space-y-1.5">{analysis.risks.map((r,i)=>(<li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="text-yellow-500 mt-0.5 shrink-0">•</span>{r}</li>))}</ul></div>}
          <p className="text-gray-700 text-xs pt-3 border-t border-gray-800">AI-generated analysis is for informational purposes only. Not financial advice.</p>
        </div>
      )}
    </div>
  );
}
