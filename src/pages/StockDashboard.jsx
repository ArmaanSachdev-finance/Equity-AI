import { useState } from 'react';
import { AlertCircle, BarChart2 } from 'lucide-react';
import SearchBar       from '../components/SearchBar.jsx';
import StockProfile    from '../components/StockProfile.jsx';
import KeyRatios       from '../components/KeyRatios.jsx';
import FinancialTables from '../components/FinancialTables.jsx';
import DCFModel        from '../components/DCFModel.jsx';
import AISummary       from '../components/AISummary.jsx';

export default function StockDashboard() {
  const [stockData,setStockData]=useState(null);const [dcfResult,setDcfResult]=useState(null);const [loading,setLoading]=useState(false);const [error,setError]=useState(null);
  const handleSearch=async(symbol)=>{
    setLoading(true);setError(null);setStockData(null);setDcfResult(null);
    try{
      const res=await fetch(`/api/stock/${symbol}`);
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||`Could not load data for "${symbol}".`);
      setStockData(data);
    }catch(err){setError(err.message);}
    finally{setLoading(false);}
  };
  return(
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart2 size={22} className="text-blue-400"/>Stock Analysis Dashboard</h1><p className="text-gray-500 text-sm mt-1">Search any ticker for live financials, a DCF valuation, and AI-generated investment analysis.</p></div>
      <SearchBar onSearch={handleSearch} loading={loading}/>
      {error&&<div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4"><AlertCircle size={17} className="text-red-400 shrink-0"/><p className="text-red-300 text-sm">{error}</p></div>}
      {loading&&<div className="space-y-4 animate-pulse">{[120,200,160,280,220].map((h,i)=>(<div key={i} style={{height:h}} className="bg-gray-900 border border-gray-800 rounded-xl"/>))}</div>}
      {stockData&&!loading&&<div className="space-y-6"><StockProfile profile={stockData.profile} quote={stockData.quote}/><KeyRatios ratios={stockData.ratios} keyMetrics={stockData.keyMetrics}/><FinancialTables income={stockData.income} balance={stockData.balance} cashflow={stockData.cashflow}/><DCFModel cashflow={stockData.cashflow} profile={stockData.profile} quote={stockData.quote} onDCFResult={setDcfResult}/><AISummary stockData={stockData} dcfResult={dcfResult}/></div>}
      {!stockData&&!loading&&!error&&<div className="text-center py-24 space-y-4"><div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto"><BarChart2 size={36} className="text-blue-400"/></div><h3 className="text-white font-semibold text-lg">Search any stock to get started</h3><p className="text-gray-500 text-sm">Enter a ticker above to load live data.</p></div>}
    </div>
  );
}
