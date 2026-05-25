import { Router } from "express";
import twilio from "twilio";

const router = Router();

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
  }
  return twilio(accountSid, authToken);
}

router.post("/sms/send", async (req, res) => {
  const { to, message } = req.body as { to: string; message: string };

  if (!to || !message) {
    res.status(400).json({ error: "to and message are required" });
    return;
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    res.status(500).json({ error: "TWILIO_PHONE_NUMBER is not configured" });
    return;
  }

  const client = getTwilioClient();
  const result = await client.messages.create({
    body: message,
    from: fromNumber,
    to,
  });

  res.json({ success: true, sid: result.sid, status: result.status });
});

export default router;
