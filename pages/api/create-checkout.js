// @deprecated — disabled. Use /api/billing/checkout instead.
// This endpoint used to trust a client-supplied `user_id` with no authentication,
// letting anyone grant a Stripe subscription to an arbitrary account (code quality
// audit CQ2). Disabled rather than fixed in place so the only supported checkout
// path is the authenticated one at /api/billing/checkout.
export default async function handler(req, res) {
  res.status(410).json({ error: 'This endpoint has been disabled. Use /api/billing/checkout.' });
}
