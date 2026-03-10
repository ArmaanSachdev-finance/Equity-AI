export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in Vercel environment variables.' });

  const { stockData, dcfResult } = req.body;
  const { profile, quote, income, ratios } = stockData;
  const li = income?.[0]  || {};
  const lr = ratios?.[0]  || {};

  const pct = (v) => v != null && !isNaN(v) ? `${(v * 100).toFixed(1)}%` : 'N/A';
  const usd = (v) => v != null && !isNaN(v) ? `$${Number(v).toFixed(2)}` : 'N/A';
  const bil = (v) => v != null && !isNaN(v) ? `$${(v / 1e9).toFixed(2)}B` : 'N/A';

  // Shorter, tighter prompt to avoid truncation
  const prompt = `You are a senior equity analyst. Return ONLY a JSON object — no markdown, no explanation, just raw JSON.

Company: ${profile.companyName} (${profile.symbol})
Sector: ${profile.sector} | Industry: ${profile.industry}
Revenue: ${bil(li.revenue)} | Net Income: ${bil(li.netIncome)}
Gross Margin: ${pct(lr.grossProfitMargin)} | Net Margin: ${pct(lr.netProfitMargin)}
P/E: ${lr.priceEarningsRatio?.toFixed(1) ?? 'N/A'} | ROE: ${pct(lr.returnOnEquity)} | D/E: ${lr.debtEquityRatio?.toFixed(2) ?? 'N/A'}
DCF Intrinsic Value: ${usd(dcfResult?.iv)} | Market Price: ${usd(quote?.price ?? quote?.currentPrice)}
Margin of Safety: ${dcfResult?.mos != null ? dcfResult.mos.toFixed(1) + '%' : 'N/A'}

Respond with exactly this JSON structure and nothing else:
{"headline":"one sentence investment thesis","financialHealth":"2 sentences on profitability and balance sheet","growthOutlook":"2 sentences on growth and competitive position","risks":["risk one","risk two","risk three"],"valuation":"2 sentences comparing DCF to market price","recommendation":"BUY","recommendationRationale":"2 sentences explaining the call","confidenceLevel":"HIGH"}

Rules:
- recommendation must be one of: BUY, HOLD, SELL
- confidenceLevel must be one of: HIGH, MEDIUM, LOW
- Keep each string under 100 words
- No trailing commas, valid JSON only`;

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
        max_tokens: 2048,   // increased from 1024 — was cutting off mid-JSON
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(500).json({ error: `Anthropic API error: ${errData?.error?.message || response.statusText}` });
    }

    const data  = await response.json();
    const raw   = data.content?.[0]?.text || '';

    // Strip any accidental markdown fences
    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    if (!clean.startsWith('{')) {
      console.error('Unexpected AI response:', clean.slice(0, 200));
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);

  } catch (err) {
    console.error('AI summary error:', err.message);
    res.status(500).json({ error: `AI analysis failed: ${err.message}` });
  }
}
