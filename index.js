const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WPPCONNECT_URL = process.env.WPPCONNECT_URL;
const TOKEN = process.env.TOKEN;
const SESSION = process.env.SESSION || 'mySession';

app.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (event === 'onmessage') {
      const from = data.from;
      const message = data.body?.toLowerCase();
      
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
      
      await fetch(`${WPPCONNECT_URL}/api/${SESSION}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          phone: from,
          message: reply,
          isGroup: false
        })
      });
    }
    
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.json({ status: 'error' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Bot chal raha hai! ✅' });
});

app.listen(PORT, () => {
  console.log(`Bot running on port ${PORT}`);
});
