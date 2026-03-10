export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { symbol } = req.query;
  const sym = (symbol || '').toUpperCase();
  const key = process.env.FMP_API_KEY;

  if (!key) return res.status(500).json({ error: 'FMP_API_KEY not set in Vercel environment variables.' });
  if (!sym) return res.status(400).json({ error: 'No ticker symbol provided.' });

  const FMP = 'https://financialmodelingprep.com/stable';

  try {
    const [profile, quote, income, balance, cashflow, ratios, metrics] = await Promise.all([
      fetch(`${FMP}/profile?symbol=${sym}&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/quote?symbol=${sym}&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/income-statement?symbol=${sym}&limit=5&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/balance-sheet-statement?symbol=${sym}&limit=5&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/cash-flow-statement?symbol=${sym}&limit=5&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/ratios?symbol=${sym}&limit=3&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/key-metrics?symbol=${sym}&limit=3&apikey=${key}`).then(r => r.json()),
    ]);

    const toArr = (d) => Array.isArray(d) ? d : (d?.data ?? []);

    const profileArr = toArr(profile);
    const quoteArr   = toArr(quote);

    let p = profileArr[0] ?? null;
    let q = quoteArr[0]   ?? null;

    if (!p || !q) {
      return res.status(404).json({ error: `Ticker "${sym}" not found. Check the symbol and try again.` });
    }

    // ── Normalise profile fields ────────────────────────────
    // New API uses marketCap, old frontend expects mktCap
    p = {
      ...p,
      mktCap:        p.mktCap        ?? p.marketCap     ?? null,
      companyName:   p.companyName   ?? p.name          ?? sym,
      exchangeShortName: p.exchangeShortName ?? p.exchange ?? '',
      image:         p.image         ?? p.logoUrl        ?? '',
    };

    // ── Normalise quote fields ──────────────────────────────
    q = {
      ...q,
      price:             q.price             ?? q.currentPrice   ?? null,
      change:            q.change            ?? q.priceChange    ?? null,
      changesPercentage: q.changesPercentage ?? q.priceChangePercent ?? null,
      '52WeekHigh':      q['52WeekHigh']     ?? q.yearHigh       ?? null,
      '52WeekLow':       q['52WeekLow']      ?? q.yearLow        ?? null,
      avgVolume:         q.avgVolume         ?? q.averageVolume  ?? null,
    };

    // ── Normalise cash flow fields ──────────────────────────
    // DCF needs freeCashFlow — new API sometimes calls it netCashFlow
    const normCashflow = toArr(cashflow).map(yr => ({
      ...yr,
      freeCashFlow:     yr.freeCashFlow     ?? yr.freeCashFlowFromOperations
                        ?? (yr.operatingCashFlow != null && yr.capitalExpenditure != null
                            ? yr.operatingCashFlow - Math.abs(yr.capitalExpenditure)
                            : null),
      operatingCashFlow: yr.operatingCashFlow ?? yr.netCashFromOperations ?? null,
      capitalExpenditure: yr.capitalExpenditure ?? yr.capitalExpenditures ?? null,
    }));

    res.status(200).json({
      profile:    p,
      quote:      q,
      income:     toArr(income),
      balance:    toArr(balance),
      cashflow:   normCashflow,
      ratios:     toArr(ratios),
      keyMetrics: toArr(metrics),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch stock data.' });
  }
}
