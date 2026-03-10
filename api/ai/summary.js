export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in Vercel environment variables.' });

  const { stockData, dcfResult } = req.body;
  const { profile, quote, income, ratios } = stockData;
  const li = income?.[0]  || {};
  const lr = ratios?.[0]  || {};

  const pct = (v) => v != null ? `${(v * 100).toFixed(1)}%` : 'N/A';
  const usd = (v) => v != null ? `$${v.toFixed(2)}`         : 'N/A';
  const bil = (v) => v != null ? `$${(v / 1e9).toFixed(2)}B`: 'N/A';

  const prompt = `You are a senior equity analyst. Analyse ${profile.companyName} (${profile.symbol}).
Sector: ${profile.sector} | Industry: ${profile.industry}
Revenue: ${bil(li.revenue)} | Net Income: ${bil(li.netIncome)}
Gross Margin: ${pct(lr.grossProfitMargin)} | Net Margin: ${pct(lr.netProfitMargin)}
P/E: ${lr.priceEarningsRatio?.toFixed(1) ?? 'N/A'} | ROE: ${pct(lr.returnOnEquity)} | D/E: ${lr.debtEquityRatio?.toFixed(2) ?? 'N/A'}
DCF Intrinsic Value: ${usd(dcfResult?.iv)} | Current Price: ${usd(quote.price)} | Margin of Safety: ${dcfResult?.mos?.toFixed(1) ?? 'N/A'}%
Description: ${profile.description?.slice(0, 400) ?? ''}

Return ONLY this exact JSON (no markdown, no extra text):
{"headline":"string","financialHealth":"string","growthOutlook":"string","risks":["string","string","string"],"valuation":"string","recommendation":"BUY","recommendationRationale":"string","confidenceLevel":"HIGH"}

recommendation must be exactly one of: BUY, HOLD, SELL
confidenceLevel must be exactly one of: HIGH, MEDIUM, LOW`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const raw  = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
    res.status(200).json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: `AI analysis failed: ${err.message}` });
  }
}
