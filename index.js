const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WPPCONNECT_URL = process.env.WPPCONNECT_URL;
const SECRET_KEY = process.env.SECRET_KEY || 'THISISMYSECURETOKEN';
const SESSION = process.env.SESSION || 'mySession';

let authToken = '';

// Generate token on startup
async function generateToken() {
  try {
    const res = await fetch(`${WPPCONNECT_URL}/api/${SESSION}/${SECRET_KEY}/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.token) {
      authToken = data.token;
      console.log('Token generated successfully!');
      await setWebhook();
    }
  } catch (e) {
    console.error('Token error:', e.message);
  }
}

// Set webhook
async function setWebhook() {
  try {
    const webhookUrl = process.env.WEBHOOK_URL || `https://whatsapp-bot-production-7d67.up.railway.app/webhook`;
    const res = await fetch(`${WPPCONNECT_URL}/api/${SESSION}/start-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ webhook: webhookUrl, waitQrCode: false })
    });
    const data = await res.json();
    console.log('Webhook set:', data.status || 'done');
  } catch (e) {
    console.error('Webhook error:', e.message);
  }
}

// Send message
async function sendMessage(phone, message) {
  try {
    await fetch(`${WPPCONNECT_URL}/api/${SESSION}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ phone, message, isGroup: false })
    });
  } catch (e) {
    console.error('Send error:', e.message);
  }
}

app.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook received:', JSON.stringify(req.body).substring(0, 200));
    const { event, data } = req.body;

    if (event === 'onmessage') {
      const from = data.from;
      const message = data.body?.toLowerCase().trim();
      console.log(`Message from ${from}: ${message}`);

      let reply = '';
      if (message === 'hi' || message === 'hello' || message === 'hii') {
        reply = '👋 Hello! Main ek bot hoon.\n\nMujhe yeh bhejo:\n1️⃣ - Info\n2️⃣ - Help\n3️⃣ - Contact';
      } else if (message === '1') {
        reply = 'ℹ️ Yeh ek test bot hai!';
      } else if (message === '2') {
        reply = '❓ Help: Hi/Hello bhejo shuru karne ke liye!';
      } else if (message === '3') {
        reply = '📞 Contact: example@gmail.com';
      } else {
        reply = '🤖 Samajh nahi aaya!\n\nHi bhejo shuru karne ke liye!';
      }

      await sendMessage(from, reply);
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.json({ status: 'error' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Bot chal raha hai! ✅' });
});

app.listen(PORT, async () => {
  console.log(`Bot running on port ${PORT}`);
  await generateToken();
});
