// @deprecated — disabled. Use /api/billing/webhook instead.
// This endpoint paired with the disabled /api/create-checkout: it blindly trusted
// session.metadata.user_id to grant subscriptions (code quality audit CQ2). Disabled
// rather than fixed in place so the only supported webhook path is /api/billing/webhook.
export default async function handler(req, res) {
  res.status(410).json({ error: 'This endpoint has been disabled. Use /api/billing/webhook.' });
}
