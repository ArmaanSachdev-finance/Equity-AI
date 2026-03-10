import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
const money=(v)=>{if(v==null||isNaN(v))return '—';const neg=v<0;const a=Math.abs(v);const s=a>=1e12?`$${(a/1e12).toFixed(2)}T`:a>=1e9?`$${(a/1e9).toFixed(2)}B`:a>=1e6?`$${(a/1e6).toFixed(2)}M`:a>=1e3?`$${(a/1e3).toFixed(0)}K`:`$${a.toFixed(0)}`;return neg?`(${s})`:s;};
const pct=(v)=>v!=null&&!isNaN(v)?`${(v*100).toFixed(1)}%`:'—';
const INCOME=[{k:'revenue',l:'Revenue',tip:'Total money earned from selling goods/services.'},{k:'costOfRevenue',l:'Cost of Revenue',tip:'Direct costs of producing what was sold.'},{k:'grossProfit',l:'Gross Profit',bold:true,tip:'Revenue minus COGS.'},{k:'grossProfitRatio',l:'Gross Margin',pct:true,tip:'Gross profit as % of revenue.'},{k:'operatingExpenses',l:'Operating Expenses',tip:'SG&A, R&D, and other operational costs.'},{k:'operatingIncome',l:'Operating Income',bold:true,tip:'Profit from core operations before interest & tax.'},{k:'operatingIncomeRatio',l:'Operating Margin',pct:true,tip:'Operating income as % of revenue.'},{k:'ebitda',l:'EBITDA',tip:'Earnings before interest, tax, depreciation & amortisation.'},{k:'netIncome',l:'Net Income',bold:true,tip:'Bottom-line profit after all expenses.'},{k:'netIncomeRatio',l:'Net Margin',pct:true,tip:'Net income as % of revenue.'},{k:'epsdiluted',l:'EPS (Diluted)',pre:'$',tip:'Net income per diluted share.'}];
const BALANCE=[{k:'cashAndCashEquivalents',l:'Cash & Equivalents',tip:'Immediately liquid assets.'},{k:'totalCurrentAssets',l:'Total Current Assets',tip:'Assets convertible to cash within 12 months.'},{k:'totalAssets',l:'Total Assets',bold:true,tip:'Everything the company owns.'},{k:'totalCurrentLiabilities',l:'Current Liabilities',tip:'Obligations due within 12 months.'},{k:'longTermDebt',l:'Long-Term Debt',tip:'Debt maturing beyond 12 months.'},{k:'totalLiabilities',l:'Total Liabilities',bold:true,tip:'Everything owed.'},{k:'totalStockholdersEquity',l:'Shareholders Equity',bold:true,tip:'Assets minus liabilities.'}];
const CASHFLOW=[{k:'operatingCashFlow',l:'Operating Cash Flow',bold:true,tip:'Cash from core business operations.'},{k:'capitalExpenditure',l:'Capital Expenditure',tip:'Spending on property, plant & equipment.'},{k:'freeCashFlow',l:'Free Cash Flow',bold:true,tip:'OCF minus capex.'},{k:'acquisitionsNet',l:'Acquisitions',tip:'Cash spent buying other businesses.'},{k:'dividendsPaid',l:'Dividends Paid',tip:'Cash returned as dividends.'},{k:'commonStockRepurchased',l:'Share Buybacks',tip:'Cash used to repurchase shares.'},{k:'netChangeInCash',l:'Net Change in Cash',tip:'Overall change in cash balance.'}];
function Section({title,rows,data}){
  const [open,setOpen]=useState(true);
  if(!data?.length)return null;
  const years=data.slice(0,5).map(d=>d.calendarYear??d.date?.slice(0,4));
  return(
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 hover:bg-gray-800/50 transition-colors">
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        {open?<ChevronUp size={16} className="text-gray-400"/>:<ChevronDown size={16} className="text-gray-400"/>}
      </button>
      {open&&<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-800"><th className="text-left px-6 py-3 text-gray-500 font-medium w-48 text-xs">Metric</th>{years.map(y=><th key={y} className="text-right px-4 py-3 text-gray-500 font-medium text-xs">{y}</th>)}<th className="w-8"/></tr></thead>
      <tbody>{rows.map(({k,l,bold,pct:isPct,pre,tip})=>(<tr key={k} className="border-b border-gray-800/40 hover:bg-gray-800/25 transition-colors"><td className={`px-6 py-3 text-xs ${bold?'text-white font-semibold':'text-gray-400'}`}>{l}</td>{data.slice(0,5).map((yr,i)=>{const v=yr[k];const str=isPct?pct(v):pre==='$'?(v!=null?`$${v.toFixed(2)}`:'—'):money(v);const neg=typeof v==='number'&&v<0;return(<td key={i} className={`text-right px-4 py-3 font-mono text-xs ${bold?'font-semibold':''} ${neg?'text-red-400':'text-blue-300'}`}>{str}</td>);})}<td className="px-3 py-3 text-gray-600 text-xs cursor-help" title={tip}>ℹ</td></tr>))}</tbody>
      </table></div>}
    </div>
  );
}
export default function FinancialTables({income,balance,cashflow}){
  return(
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Financial Statements — 5-Year History</h3>
      <Section title="📊 Income Statement"    rows={INCOME}   data={income}/>
      <Section title="🏦 Balance Sheet"       rows={BALANCE}  data={balance}/>
      <Section title="💵 Cash Flow Statement" rows={CASHFLOW} data={cashflow}/>
    </div>
  );
}
