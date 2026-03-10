import { useState, useEffect, useCallback } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
const bil=(n)=>{if(n==null||isNaN(n))return 'N/A';if(Math.abs(n)>=1e12)return`$${(n/1e12).toFixed(2)}T`;if(Math.abs(n)>=1e9)return`$${(n/1e9).toFixed(2)}B`;if(Math.abs(n)>=1e6)return`$${(n/1e6).toFixed(2)}M`;return`$${n.toFixed(2)}`;};
function runDCF({cashflow,profile,quote,g,r,tg,years}){
  if(!cashflow?.length||!profile||!quote)return null;
  const fcfs=cashflow.slice(0,3).map(y=>y.freeCashFlow).filter(v=>v!=null&&!isNaN(v));
  if(!fcfs.length)return null;
  const baseFCF=fcfs.reduce((a,b)=>a+b,0)/fcfs.length;
  const proj=Array.from({length:years},(_,i)=>baseFCF*Math.pow(1+g,i+1));
  const pvProj=proj.map((f,i)=>f/Math.pow(1+r,i+1));
  const sumPV=pvProj.reduce((a,b)=>a+b,0);
  const tv=proj[years-1]*(1+tg)/(r-tg);
  const pvTV=tv/Math.pow(1+r,years);
  const totalPV=sumPV+pvTV;
  const shares=profile.mktCap/quote.price;
  const iv=totalPV/shares;
  const mos=((iv-quote.price)/iv)*100;
  return{baseFCF,proj,pvProj,sumPV,tv,pvTV,totalPV,shares,iv,mos,g,r,tg};
}
export default function DCFModel({cashflow,profile,quote,onDCFResult}){
  const [g,setG]=useState(0.10);const [r,setR]=useState(0.10);const [tg,setTg]=useState(0.025);
  const years=5;const [open,setOpen]=useState(true);const [res,setRes]=useState(null);
  const recalc=useCallback(()=>{const d=runDCF({cashflow,profile,quote,g,r,tg,years});setRes(d);if(d&&onDCFResult)onDCFResult(d);},[cashflow,profile,quote,g,r,tg]);
  useEffect(()=>{recalc();},[recalc]);
  if(!cashflow?.length)return null;
  const under=res?.mos>0;
  const sliders=[{label:'FCF Growth Rate',v:g,set:setG,min:0,max:0.50,step:0.005,clr:'text-blue-400',tip:'Expected annual FCF growth over 5 years.'},{label:'Discount Rate (WACC)',v:r,set:setR,min:0.05,max:0.25,step:0.005,clr:'text-purple-400',tip:'Required rate of return. Typically 8–12% for large-caps.'},{label:'Terminal Growth Rate',v:tg,set:setTg,min:0.01,max:0.05,step:0.005,clr:'text-green-400',tip:'Long-run perpetual growth ≈ GDP. Must be below discount rate.'}];
  return(
    <div className="card space-y-6">
      <div className="flex items-center gap-2"><Calculator size={20} className="text-blue-400"/><h3 className="text-lg font-semibold text-white">DCF Valuation Model</h3></div>
      <div className="bg-gray-800/40 rounded-xl p-5 space-y-5">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model Assumptions</h4>
        <div className="grid md:grid-cols-3 gap-6">
          {sliders.map(({label,v,set,min,max,step,clr,tip})=>(
            <div key={label} className="space-y-2">
              <div className="flex justify-between items-center"><span className="text-gray-400 text-xs">{label}</span><span className={`${clr} font-mono text-sm font-bold`}>{(v*100).toFixed(1)}%</span></div>
              <input type="range" min={min} max={max} step={step} value={v} onChange={e=>set(parseFloat(e.target.value))} className="w-full accent-blue-500 cursor-pointer h-1.5"/>
              <p className="text-gray-600 text-xs">{tip}</p>
            </div>
          ))}
        </div>
      </div>
      {res&&(
        <div className={`rounded-xl p-5 border ${under?'bg-green-500/8 border-green-500/25':'bg-red-500/8 border-red-500/25'}`}>
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
            <div><div className="text-gray-500 text-xs mb-1">DCF Intrinsic Value</div><div className={`text-3xl font-bold ${under?'text-green-400':'text-red-400'}`}>${res.iv?.toFixed(2)}</div></div>
            <div><div className="text-gray-500 text-xs mb-1">Current Market Price</div><div className="text-2xl font-semibold text-white">${quote.price?.toFixed(2)}</div></div>
            <div className="text-right"><div className="text-gray-500 text-xs mb-1">Margin of Safety</div><div className={`text-2xl font-bold ${under?'text-green-400':'text-red-400'}`}>{res.mos?.toFixed(1)}%</div><div className="text-xs mt-1 text-gray-400">{under?'📈 Potentially Undervalued':'📉 Potentially Overvalued'}</div></div>
          </div>
        </div>
      )}
      {res&&(
        <div className="border border-gray-800 rounded-xl overflow-hidden">
          <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-5 py-4 bg-gray-900 hover:bg-gray-800/50 transition-colors">
            <span className="text-sm font-semibold text-white">Step-by-Step Calculation</span>
            {open?<ChevronUp size={15} className="text-gray-400"/>:<ChevronDown size={15} className="text-gray-400"/>}
          </button>
          {open&&(
            <div className="p-6 space-y-6 text-sm">
              <div><div className="flex items-center gap-2 mb-2"><span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold shrink-0">1</span><span className="font-semibold text-gray-200">Baseline FCF (3-Year Average)</span></div><div className="ml-7 bg-gray-800/50 rounded-lg px-4 py-3 font-mono text-xs"><span className="text-gray-400">Avg FCF = </span><span className="text-blue-300 font-bold">{bil(res.baseFCF)}</span></div></div>
              <div><div className="flex items-center gap-2 mb-2"><span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold shrink-0">2</span><span className="font-semibold text-gray-200">Project FCF × {years} Years @ {(res.g*100).toFixed(1)}% Growth</span></div>
                <div className="ml-7 overflow-x-auto"><table className="text-xs w-full"><thead><tr className="text-gray-500 border-b border-gray-700"><th className="text-left py-2 pr-4">Year</th>{res.proj.map((_,i)=><th key={i} className="text-right py-2 px-2">Y{i+1}</th>)}</tr></thead><tbody><tr className="border-b border-gray-800"><td className="text-gray-400 py-2 pr-4">Projected FCF</td>{res.proj.map((v,i)=><td key={i} className="text-right px-2 py-2 text-blue-300 font-mono">{bil(v)}</td>)}</tr><tr><td className="text-gray-400 py-2 pr-4">PV of FCF</td>{res.pvProj.map((v,i)=><td key={i} className="text-right px-2 py-2 text-green-400 font-mono">{bil(v)}</td>)}</tr></tbody></table></div>
                <div className="ml-7 mt-2 bg-gray-800/50 rounded-lg px-4 py-3 font-mono text-xs"><span className="text-gray-400">Sum of PV(FCFs) = </span><span className="text-green-400 font-bold">{bil(res.sumPV)}</span></div>
              </div>
              <div><div className="flex items-center gap-2 mb-2"><span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold shrink-0">3</span><span className="font-semibold text-gray-200">Terminal Value</span></div><div className="ml-7 bg-gray-800/50 rounded-lg px-4 py-3 font-mono text-xs space-y-1"><div><span className="text-gray-400">Terminal Value = </span><span className="text-purple-400 font-bold">{bil(res.tv)}</span></div><div><span className="text-gray-400">PV of Terminal Value = </span><span className="text-purple-400 font-bold">{bil(res.pvTV)}</span></div></div></div>
              <div><div className="flex items-center gap-2 mb-2"><span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold shrink-0">4</span><span className="font-semibold text-gray-200">Intrinsic Value Per Share</span></div><div className="ml-7 bg-gray-800/50 rounded-lg px-4 py-3 font-mono text-xs space-y-1.5"><div><span className="text-gray-400">Total PV = </span><span className="text-blue-300 font-bold">{bil(res.totalPV)}</span></div><div><span className="text-gray-400">Shares = </span><span className="text-gray-300">{(res.shares/1e9).toFixed(2)}B</span></div><div className="pt-2 border-t border-gray-700"><span className="text-gray-400">Intrinsic Value = </span><span className={`font-bold text-base ${under?'text-green-400':'text-red-400'}`}>${res.iv?.toFixed(2)}</span></div></div></div>
              <p className="text-gray-600 text-xs border-t border-gray-800 pt-4">⚠️ For educational purposes only — not financial advice.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
