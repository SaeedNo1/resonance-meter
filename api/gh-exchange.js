export default async function handler(req, res) {
  const ALLOW_ORIGIN = 'https://saeedno1.github.io'; // 你的 GitHub Pages 域
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const code = req.method === 'POST' ? req.body?.code : req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'missing_code' });
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      // 最好也带上 redirect_uri，需与 OAuth App 一致
      redirect_uri: process.env.GITHUB_REDIRECT_URI || 'https://saeedno1.github.io/resonance-meter/callback.html'
    });

    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const data = await r.json();
    if (data.error) {
      return res.status(400).json(data);
    }
    return res.status(200).json(data); // { access_token, token_type, scope }
  } catch (e) {
    return res.status(500).json({ error: 'exchange_failed', detail: String(e) });
  }
}
