import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  pro: 'price_1TkAIMFhDaeXj1q8W3BnIuSv',
  premium: 'price_1TkXXtFhDaeXj1q8ZUMJqp1M',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { plan } = req.body;
    const priceId = PRICE_IDS[plan] || PRICE_IDS.pro;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        user_id: req.body.user_id || '',
        plan: plan,
      },
    });    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}