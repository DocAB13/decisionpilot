export default function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.redirect('/');
  
  try {
    const decoded = decodeURIComponent(url);
    const amazonUrl = new URL(decoded);
    amazonUrl.searchParams.set('tag', 'decisionpilot-20');
    res.redirect(301, amazonUrl.toString());
  } catch {
    res.redirect('/');
  }
}
