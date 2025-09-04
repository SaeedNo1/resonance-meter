export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://saeedno1.github.io'); // 只允许你的站
  const code = req.query.code;
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  });
  const data = await r.json();
  res.status(200).json(data); // { access_token, token_type, scope }
}
