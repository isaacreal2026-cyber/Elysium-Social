import { Router } from "express";
import Stripe from "stripe";
import { db } from "@workspace/db";
import { payments } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY must be set");
  return new Stripe(key);
}

router.post("/payments/create-intent", async (req, res) => {
  const {
    amount,
    currency = "usd",
    description,
  } = req.body as {
    amount: number;
    currency?: string;
    description?: string;
  };

  if (!amount || amount < 50) {
    res.status(400).json({ error: "amount must be at least 50 (cents)" });
    return;
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount,
    currency,
    description,
    automatic_payment_methods: { enabled: true },
  });

  await db.insert(payments).values({
    stripePaymentIntentId: intent.id,
    amount,
    currency,
    status: intent.status,
    description: description ?? null,
  });

  res.json({
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount,
    currency,
  });
});

router.post("/payments/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && sig) {
    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        webhookSecret,
      );
    } catch {
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await db
        .update(payments)
        .set({ status: "succeeded" })
        .where(eq(payments.stripePaymentIntentId, intent.id));
    }
  }

  res.json({ received: true });
});

router.get("/payments/history", async (_req, res) => {
  const history = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.createdAt));
  res.json(history);
});

export default router;
