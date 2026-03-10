export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { symbol } = req.query;
  const sym = (symbol || '').toUpperCase();
  const key = process.env.FMP_API_KEY;

  if (!key) return res.status(500).json({ error: 'FMP_API_KEY not set in Vercel environment variables.' });
  if (!sym) return res.status(400).json({ error: 'No ticker symbol provided.' });

  const FMP = 'https://financialmodelingprep.com/api';

  try {
    const [profile, quote, income, balance, cashflow, ratios, metrics] = await Promise.all([
      fetch(`${FMP}/v3/profile/${sym}?apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/v3/quote/${sym}?apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/v3/income-statement/${sym}?limit=5&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/v3/balance-sheet-statement/${sym}?limit=5&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/v3/cash-flow-statement/${sym}?limit=5&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/v3/ratios/${sym}?limit=3&apikey=${key}`).then(r => r.json()),
      fetch(`${FMP}/v3/key-metrics/${sym}?limit=3&apikey=${key}`).then(r => r.json()),
    ]);

    const p = Array.isArray(profile) ? profile[0] : null;
    const q = Array.isArray(quote)   ? quote[0]   : null;

    if (!p || !q) return res.status(404).json({ error: `Ticker "${sym}" not found. Check the symbol and try again.` });

    res.status(200).json({
      profile:    p,
      quote:      q,
      income:     Array.isArray(income)   ? income   : [],
      balance:    Array.isArray(balance)  ? balance  : [],
      cashflow:   Array.isArray(cashflow) ? cashflow : [],
      ratios:     Array.isArray(ratios)   ? ratios   : [],
      keyMetrics: Array.isArray(metrics)  ? metrics  : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch stock data.' });
  }
}
