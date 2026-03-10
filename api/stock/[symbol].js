export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { symbol } = req.query;
  const sym = (symbol || '').toUpperCase();
  const key = process.env.FMP_API_KEY;

  if (!key) return res.status(500).json({ error: 'FMP_API_KEY not set in Vercel environment variables.' });
  if (!sym) return res.status(400).json({ error: 'No ticker symbol provided.' });

  // New FMP stable API base (v3 was deprecated August 2025)
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

    // New API returns data array or object — normalise both shapes
    const toArr = (d) => Array.isArray(d) ? d : (d?.data ?? []);

    const profileArr = toArr(profile);
    const quoteArr   = toArr(quote);

    const p = profileArr[0] ?? null;
    const q = quoteArr[0]   ?? null;

    if (!p || !q) {
      return res.status(404).json({ error: `Ticker "${sym}" not found. Check the symbol and try again.` });
    }

    res.status(200).json({
      profile:    p,
      quote:      q,
      income:     toArr(income),
      balance:    toArr(balance),
      cashflow:   toArr(cashflow),
      ratios:     toArr(ratios),
      keyMetrics: toArr(metrics),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch stock data.' });
  }
}
